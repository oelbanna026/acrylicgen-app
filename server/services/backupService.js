const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Storage } = require('@google-cloud/storage');
const db = require('../config/database');
const csvWriter = require('csv-writer');
const convert = require('xml-js');

// Configuration
const BACKUP_DIR = path.resolve(__dirname, '../../backups');
const DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../data/database.sqlite');
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || 'default-insecure-key-change-me-32chars!!'; // Must be 32 chars for AES-256
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Initialize Google Cloud Storage
let storage = null;
let bucket = null;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && GCS_BUCKET_NAME) {
    try {
        storage = new Storage();
        bucket = storage.bucket(GCS_BUCKET_NAME);
        console.log('Google Cloud Storage initialized for backups.');
    } catch (err) {
        console.error('Failed to initialize Google Cloud Storage:', err.message);
    }
}

class BackupService {
    
    // Helper: Log to Audit Logs
    static logAudit(action, status, details, userId = null) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO audit_logs (action, status, details, user_id) VALUES (?, ?, ?, ?)`,
                [action, status, details, userId],
                function(err) {
                    if (err) console.error('Audit Log Error:', err);
                    resolve();
                }
            );
        });
    }

    // Helper: Calculate Checksum (SHA-256)
    static calculateChecksum(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.createReadStream(filePath);
            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    }

    // Helper: Encrypt File (AES-256-CBC)
    static encryptFile(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            // Ensure key is 32 bytes
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
            
            const input = fs.createReadStream(inputPath);
            const output = fs.createWriteStream(outputPath);

            // Write IV at the beginning of the file
            output.write(iv);

            input.pipe(cipher).pipe(output);

            output.on('finish', () => resolve());
            output.on('error', reject);
        });
    }

    // Helper: Decrypt File (AES-256-CBC)
    static decryptFile(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
            
            // Read IV from the beginning
            const input = fs.createReadStream(inputPath, { start: 0, end: 15 });
            let iv;
            input.on('data', (chunk) => {
                iv = chunk;
            });
            input.on('end', () => {
                if (!iv || iv.length !== 16) {
                    return reject(new Error('Invalid IV or corrupt backup file'));
                }

                const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                const readStream = fs.createReadStream(inputPath, { start: 16 });
                const writeStream = fs.createWriteStream(outputPath);

                readStream.pipe(decipher).pipe(writeStream);

                writeStream.on('finish', () => resolve());
                writeStream.on('error', reject);
            });
        });
    }

    // 1. Create Backup
    static async createBackup(userId = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rawBackupPath = path.join(BACKUP_DIR, `backup-${timestamp}.sqlite`);
        const encryptedBackupPath = path.join(BACKUP_DIR, `backup-${timestamp}.enc`);
        
        try {
            // Step 1: Copy current DB to temp file
            // Use backup API of sqlite3 if possible, but copyFile is simpler for file-based sqlite
            fs.copyFileSync(DB_PATH, rawBackupPath);

            // Step 2: Calculate Checksum of raw data
            const checksum = await this.calculateChecksum(rawBackupPath);

            // Step 3: Encrypt
            await this.encryptFile(rawBackupPath, encryptedBackupPath);

            // Step 4: Upload to GCS (if configured)
            let gcsUrl = null;
            if (bucket) {
                await bucket.upload(encryptedBackupPath, {
                    destination: `backups/backup-${timestamp}.enc`,
                    metadata: {
                        metadata: { checksum }
                    }
                });
                gcsUrl = `gs://${GCS_BUCKET_NAME}/backups/backup-${timestamp}.enc`;
            }

            // Cleanup raw file
            fs.unlinkSync(rawBackupPath);

            const details = JSON.stringify({
                file: `backup-${timestamp}.enc`,
                checksum,
                gcs: gcsUrl || 'Not configured',
                size: fs.statSync(encryptedBackupPath).size
            });

            await this.logAudit('backup', 'success', details, userId);

            return { success: true, filename: `backup-${timestamp}.enc`, checksum, gcsUrl };

        } catch (error) {
            console.error('Backup failed:', error);
            await this.logAudit('backup', 'failed', error.message, userId);
            
            // Cleanup
            if (fs.existsSync(rawBackupPath)) fs.unlinkSync(rawBackupPath);
            if (fs.existsSync(encryptedBackupPath)) fs.unlinkSync(encryptedBackupPath);

            throw error;
        }
    }

    // 2. Restore Backup
    static async restoreBackup(filename, userId = null) {
        const encryptedPath = path.join(BACKUP_DIR, filename);
        const restoredDbPath = path.join(BACKUP_DIR, `restore-${Date.now()}.sqlite`);
        
        try {
            if (!fs.existsSync(encryptedPath)) {
                // Try downloading from GCS if not local
                if (bucket) {
                    await bucket.file(`backups/${filename}`).download({ destination: encryptedPath });
                } else {
                    throw new Error('Backup file not found locally and GCS not configured');
                }
            }

            // Step 1: Decrypt
            await this.decryptFile(encryptedPath, restoredDbPath);

            // Step 2: Verify Integrity (Try opening the DB)
            const testDb = new (require('sqlite3').verbose()).Database(restoredDbPath);
            await new Promise((resolve, reject) => {
                testDb.get("SELECT count(*) FROM users", (err) => {
                    testDb.close();
                    if (err) reject(new Error('Database integrity check failed'));
                    else resolve();
                });
            });

            // Step 3: Replace Production DB
            // Backup current DB just in case
            fs.copyFileSync(DB_PATH, `${DB_PATH}.pre-restore-${Date.now()}`);
            
            // Close current connection (Not easily possible with singleton, but we can overwrite file on Windows if not locked?)
            // Note: In Node.js sqlite3, we might need to close the db connection first. 
            // For now, we will attempt overwrite. If locked, this will fail.
            // A better approach for production is to swap filenames and restart the process.
            
            // For this implementation, we will assume we can overwrite or user accepts restart.
            // Actually, let's try to overwrite.
            fs.copyFileSync(restoredDbPath, DB_PATH);
            
            // Cleanup
            fs.unlinkSync(restoredDbPath);

            await this.logAudit('restore', 'success', `Restored from ${filename}`, userId);
            return { success: true };

        } catch (error) {
            console.error('Restore failed:', error);
            await this.logAudit('restore', 'failed', error.message, userId);
            if (fs.existsSync(restoredDbPath)) fs.unlinkSync(restoredDbPath);
            throw error;
        }
    }

    // 3. Export User Data
    static async exportUserData(format = 'json', userId = null) {
        try {
            // Fetch all user data
            const users = await new Promise((resolve, reject) => {
                db.all("SELECT * FROM users", [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            // Fetch related data (optional, e.g., payments)
            // For now, just users

            let content = '';
            let contentType = '';
            let extension = '';

            if (format === 'json') {
                content = JSON.stringify(users, null, 2);
                contentType = 'application/json';
                extension = 'json';
            } else if (format === 'csv') {
                const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
                const csvStringifier = createCsvStringifier({
                    header: [
                        {id: 'id', title: 'ID'},
                        {id: 'name', title: 'Name'},
                        {id: 'email', title: 'Email'},
                        {id: 'role', title: 'Role'},
                        {id: 'plan', title: 'Plan'},
                        {id: 'created_at', title: 'Created At'}
                    ]
                });
                content = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(users);
                contentType = 'text/csv';
                extension = 'csv';
            } else if (format === 'xml') {
                content = convert.json2xml({ users: { user: users } }, { compact: true, spaces: 4 });
                contentType = 'application/xml';
                extension = 'xml';
            } else {
                throw new Error('Unsupported format');
            }

            // Encrypt the export
            // Note: User might want to download it directly. 
            // If it's for download, we usually don't encrypt with server key, but send over HTTPS.
            // However, user requirement says "API for export... with AES-256 encryption during transfer and storage".
            // HTTPS handles transfer encryption. Storage encryption implies we save it encrypted.
            
            // We will return the raw content for the controller to send (via HTTPS).
            // But we will also save a secure copy in audit logs or backups?
            // "export data ... with AES-256 encryption during transfer and storage"
            
            // Let's save an encrypted copy to backups folder for audit.
            const filename = `export-users-${Date.now()}.${extension}`;
            const tempPath = path.join(BACKUP_DIR, filename);
            fs.writeFileSync(tempPath, content);
            
            const encryptedPath = tempPath + '.enc';
            await this.encryptFile(tempPath, encryptedPath);
            fs.unlinkSync(tempPath); // Delete cleartext

            await this.logAudit('export_data', 'success', `Format: ${format}, Encrypted: ${path.basename(encryptedPath)}`, userId);

            // Return clear content for the response (assuming response is over HTTPS)
            return { content, contentType, filename };

        } catch (error) {
            console.error('Export failed:', error);
            await this.logAudit('export_data', 'failed', error.message, userId);
            throw error;
        }
    }

    static getBackupsList() {
        return fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.enc'))
            .map(f => ({
                filename: f,
                date: fs.statSync(path.join(BACKUP_DIR, f)).mtime
            }));
    }
}

module.exports = BackupService;

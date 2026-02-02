# Backup & Recovery System Documentation

## Overview
The Acrylic Generator SaaS includes a comprehensive backup and recovery system designed to protect user data and ensure business continuity. The system supports automated daily backups, secure cloud storage (Google Cloud Storage), AES-256 encryption, and full GDPR compliance features.

## 1. System Configuration

### Environment Variables
To enable full functionality, configure the following variables in `server/.env`:

```env
# Encryption Key for Backups (Must be 32 characters for AES-256)
BACKUP_ENCRYPTION_KEY=your-secure-32-char-random-key-here!!

# Google Cloud Storage (Optional - Falls back to local storage if missing)
GCS_BUCKET_NAME=your-gcs-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

### Dependencies
The system relies on the following packages:
- `node-cron`: Task scheduling
- `@google-cloud/storage`: Cloud sync
- `csv-writer` & `xml-js`: Data export formats

## 2. Automated Synchronization
- **Schedule**: Backups run automatically every day at **00:00 (Midnight)** server time.
- **Process**:
  1. SQLite database is locked/copied.
  2. Checksum (SHA-256) is calculated for integrity verification.
  3. File is encrypted using AES-256-CBC.
  4. Encrypted file is uploaded to Google Cloud Storage (if configured) and stored locally in `backups/`.
  5. Operation is logged in `audit_logs` table.

## 3. Data Export (GDPR Compliance)
Administrators can export user data in multiple formats via the Admin Dashboard:
- **Formats**: JSON, CSV, XML.
- **Security**: Data is encrypted during transfer (HTTPS) and optionally during storage if saved as a backup artifact.
- **Usage**: Fulfills "Right to Data Portability" requests.

## 4. Emergency Restore Procedures

### Method A: Admin Dashboard (Recommended)
1. Login to Admin Dashboard.
2. Navigate to **Backups**.
3. Locate the desired backup point.
4. Click **Restore**.
   - *Warning: This will overwrite the current database. The system will create a pre-restore checkpoint automatically.*

### Method B: Manual Recovery (Catastrophic Failure)
If the Admin Dashboard is inaccessible:
1. Access the server via SSH/Terminal.
2. Navigate to `server/backups/`.
3. Locate the target `.enc` file.
4. Use the `BackupService` manually or decrypt using OpenSSL (if key is known).
   - *Note: It is recommended to fix the server and use the API for restoration to ensure integrity checks run.*

## 5. Audit Logging
All operations are logged in the database `audit_logs` table:
- **Action**: `backup`, `restore`, `export_data`
- **Status**: `success` or `failed`
- **User ID**: ID of the admin who triggered the action (null for automated tasks)
- **Timestamp**: Time of execution

## 6. Security & GDPR
- **Encryption**: All backups are encrypted at rest using AES-256.
- **Integrity**: SHA-256 checksums prevent data corruption or tampering.
- **Access Control**: Only Admins can trigger restores or exports.
- **Right to Erasure**: Admin can delete users (via Users page), which is reflected in subsequent backups.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const fs = require('fs');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../data/database.sqlite');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Backup Database on Startup
if (fs.existsSync(dbPath)) {
    const backupPath = `${dbPath}.backup`;
    try {
        fs.copyFileSync(dbPath, backupPath);
        console.log(`Database backup created at ${backupPath}`);
    } catch (err) {
        console.error('Failed to create database backup:', err);
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Enable WAL mode for better concurrency
        db.run('PRAGMA journal_mode = WAL');
        initDb();
    }
});

const bcrypt = require('bcryptjs');

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            plan TEXT DEFAULT 'free', -- free, starter, pro, business
            credits INTEGER DEFAULT 3,
            subscription_status TEXT DEFAULT 'active', -- active, canceled, past_due
            stripe_customer_id TEXT,
            role TEXT DEFAULT 'user' -- user, admin
        )`);

        // Ensure Admin Exists
        const adminEmail = 'oelbanna026@gmail.com';
        db.get('SELECT id FROM users WHERE email = ?', [adminEmail], (err, row) => {
            if (!row) {
                const hashedPassword = bcrypt.hashSync('Acrylic@2026', 8);
                db.run(`INSERT INTO users (name, email, password, role, plan, credits) VALUES (?, ?, ?, ?, ?, ?)`, 
                    ['Admin User', adminEmail, hashedPassword, 'admin', 'business', -1], 
                    (err) => {
                        if (err) console.error('Error seeding admin:', err.message);
                        else console.log('Admin user seeded automatically.');
                    }
                );
            }
        });

        // Migration: Add role column if it doesn't exist (for existing dbs)
        db.all("PRAGMA table_info(users)", (err, rows) => {
            if (!err && rows) {
                const hasRole = rows.some(r => r.name === 'role');
                if (!hasRole) {
                    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
                }
                
                const hasLastLogin = rows.some(r => r.name === 'last_login');
                if (!hasLastLogin) {
                    db.run("ALTER TABLE users ADD COLUMN last_login DATETIME");
                }

                const hasIp = rows.some(r => r.name === 'ip');
                if (!hasIp) {
                    db.run("ALTER TABLE users ADD COLUMN ip TEXT");
                }

                const hasLocation = rows.some(r => r.name === 'location');
                if (!hasLocation) {
                    db.run("ALTER TABLE users ADD COLUMN location TEXT");
                }
            }
        });

        // Transactions/Exports Table
        db.run(`CREATE TABLE IF NOT EXISTS exports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT, -- dxf, svg
            filename TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            cost INTEGER DEFAULT 1,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Payment History Table
        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount REAL,
            currency TEXT,
            payment_method TEXT, -- stripe, paypal
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Site Statistics Table
        db.run(`CREATE TABLE IF NOT EXISTS site_stats (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            total_views INTEGER DEFAULT 0
        )`);
        
        // Initialize site_stats if empty
        db.run(`INSERT OR IGNORE INTO site_stats (id, total_views) VALUES (1, 0)`);

        // Active Sessions Table (for real-time active users)
        db.run(`CREATE TABLE IF NOT EXISTS active_sessions (
            id TEXT PRIMARY KEY,
            last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip TEXT,
            user_agent TEXT
        )`);

        // Daily Unique Visitors (for conversion rate calculation)
        db.run(`CREATE TABLE IF NOT EXISTS daily_visitors (
            ip TEXT,
            date TEXT,
            PRIMARY KEY (ip, date)
        )`);

        // Ads Table
        db.run(`CREATE TABLE IF NOT EXISTS ads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            type TEXT, -- banner, sidebar, interstitial
            placement TEXT,
            impressions INTEGER DEFAULT 0,
            clicks INTEGER DEFAULT 0,
            revenue REAL DEFAULT 0,
            status TEXT DEFAULT 'active' -- active, paused
        )`);
        
        // Seed Initial Ads if empty
        db.get("SELECT count(*) as count FROM ads", (err, row) => {
            if (!err && row.count === 0) {
                const initialAds = [
                    ['Sidebar Banner', 'banner', 'sidebar', 12000, 450, 120.50, 'active'],
                    ['Export Interstitial', 'interstitial', 'export_flow', 8500, 320, 85.00, 'active'],
                    ['Footer Leaderboard', 'banner', 'footer', 5000, 120, 30.00, 'paused']
                ];
                const stmt = db.prepare("INSERT INTO ads (name, type, placement, impressions, clicks, revenue, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
                initialAds.forEach(ad => stmt.run(ad));
                stmt.finalize();
            }
        });
    });
}

module.exports = db;
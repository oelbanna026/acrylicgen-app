const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const fs = require('fs');

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../data/database.sqlite');
const dbDir = path.dirname(dbPath);

// Ensure data directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

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
            credits INTEGER DEFAULT 5,
            subscription_status TEXT DEFAULT 'active', -- active, canceled, past_due
            stripe_customer_id TEXT,
            role TEXT DEFAULT 'user' -- user, admin
        )`);

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
    });
}

module.exports = db;
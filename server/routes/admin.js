const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', verifyAdmin, (req, res) => {
    const stats = {};
    
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalUsers = row.count;
        
        db.get('SELECT COUNT(*) as count FROM exports', (err, row) => {
            stats.totalExports = row.count;
            
            db.get('SELECT SUM(amount) as total FROM payments', (err, row) => {
                stats.totalRevenue = row.total || 0;
                
                // Active users in last 15 mins
                const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
                db.get('SELECT COUNT(*) as count FROM users WHERE last_login > ?', [fifteenMinsAgo], (err, activeRow) => {
                    stats.activeNow = activeRow ? activeRow.count : 0;
                    res.status(200).json(stats);
                });
            });
        });
    });
});

router.get('/users', verifyAdmin, (req, res) => {
    db.all('SELECT id, name, email, plan, credits, role, created_at, last_login, ip, location FROM users ORDER BY created_at DESC LIMIT 100', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// Create User
router.post('/users', verifyAdmin, (req, res) => {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const hashedPassword = bcrypt.hashSync(password, 8);
    const userRole = role || 'user';

    db.run(`INSERT INTO users (name, email, password, role, plan, credits) VALUES (?, ?, ?, ?, 'free', 3)`, 
        [name, email, hashedPassword, userRole], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            // Return the created user
            db.get('SELECT id, name, email, plan, credits, role, created_at FROM users WHERE id = ?', [this.lastID], (err, row) => {
                res.status(201).json(row);
            });
        }
    );
});

// Delete User
router.delete('/users/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, deleted: this.changes });
    });
});

// Get Payments
router.get('/payments', verifyAdmin, (req, res) => {
    db.all(`SELECT p.*, u.name as user_name, u.email as user_email 
            FROM payments p 
            LEFT JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC LIMIT 50`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// Get Exports (Projects)
router.get('/exports', verifyAdmin, (req, res) => {
    db.all(`SELECT e.*, u.name as user_name 
            FROM exports e 
            LEFT JOIN users u ON e.user_id = u.id 
            ORDER BY e.created_at DESC LIMIT 50`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// Get Ads
router.get('/ads', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM ads ORDER BY revenue DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

// Update Ad Status
router.post('/ads/:id/status', verifyAdmin, (req, res) => {
    const { status } = req.body;
    db.run('UPDATE ads SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// Get Settings
router.get('/settings', verifyAdmin, (req, res) => {
    db.all('SELECT * FROM settings', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.status(200).json(settings);
    });
});

// Update Settings
router.post('/settings', verifyAdmin, (req, res) => {
    const settings = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        for (const [key, value] of Object.entries(settings)) {
            stmt.run(key, String(value));
        }
        db.run("COMMIT", (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    });
    stmt.finalize();
});

const BackupService = require('../services/backupService');

// --- Backup & Restore Routes ---

// Create Backup
router.post('/backups', verifyAdmin, async (req, res) => {
    try {
        const result = await BackupService.createBackup(req.userId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Restore Backup
router.post('/backups/restore', verifyAdmin, async (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    try {
        await BackupService.restoreBackup(filename, req.userId);
        res.json({ success: true, message: 'Database restored successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List Backups
router.get('/backups', verifyAdmin, (req, res) => {
    try {
        const backups = BackupService.getBackupsList();
        res.json(backups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export Data
router.get('/backups/export', verifyAdmin, async (req, res) => {
    const { format } = req.query; // json, csv, xml
    try {
        const result = await BackupService.exportUserData(format || 'json', req.userId);
        res.setHeader('Content-Type', result.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
        res.send(result.content);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

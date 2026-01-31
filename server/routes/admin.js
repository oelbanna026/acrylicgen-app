const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_prod';

// Admin Middleware
const verifyAdmin = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        
        db.get('SELECT role FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err || !user) return res.status(401).json({ error: 'Unauthorized' });
            if (user.role !== 'admin') return res.status(403).json({ error: 'Requires Admin Role' });
            req.userId = decoded.id;

            // Update last_login
            db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [req.userId]);

            next();
        });
    });
};

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

module.exports = router;
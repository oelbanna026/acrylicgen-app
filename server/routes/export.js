const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_prod';

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// Check Credits and Deduct
router.post('/deduct', verifyToken, (req, res) => {
    const { type, filename } = req.body; // type: 'dxf' or 'svg'

    db.get(`SELECT credits, plan FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Business and Pro plans have unlimited exports
        if (user.plan === 'business' || user.plan === 'pro') {
            logExport(req.userId, type, filename, 0);
            return res.status(200).json({ success: true, credits: 'unlimited', message: 'Export allowed (' + user.plan + ' Plan)' });
        }

        if (user.credits <= 0) {
            return res.status(402).json({ error: 'Insufficient credits', credits: 0 });
        }

        // Deduct 1 credit
        db.run(`UPDATE users SET credits = credits - 1 WHERE id = ?`, [req.userId], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to deduct credit' });
            
            logExport(req.userId, type, filename, 1);
            res.status(200).json({ success: true, credits: user.credits - 1 });
        });
    });
});

function logExport(userId, type, filename, cost) {
    db.run(`INSERT INTO exports (user_id, type, filename, cost) VALUES (?, ?, ?, ?)`, [userId, type, filename, cost]);
}

// Get Export History
router.get('/history', verifyToken, (req, res) => {
    db.all(`SELECT * FROM exports WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(rows);
    });
});

module.exports = router;
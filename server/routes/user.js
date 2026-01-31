const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_prod';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.userId = decoded.id;

        // Update last_login for activity tracking
        db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [req.userId]);

        next();
    });
};

// Get User Profile
router.get('/profile', verifyToken, (req, res) => {
    db.get(`SELECT id, name, email, plan, credits, created_at, role FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    });
});

module.exports = router;
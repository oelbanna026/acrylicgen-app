const express = require('express');
const db = require('../config/database');
const { verifyAuth } = require('../middleware/auth');
const router = express.Router();

// Get User Profile
router.get('/profile', verifyAuth, (req, res) => {
    db.get(`SELECT id, name, email, plan, credits, created_at, role FROM users WHERE id = ?`, [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) {
            console.error(`Profile Error: Token valid but User ID ${req.userId} not found in DB.`);
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    });
});

module.exports = router;

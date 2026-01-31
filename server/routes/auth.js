const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '848633901532-m8q0ors3lj860dbj2l0ie1gknvepi2h1.apps.googleusercontent.com'; 
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Google Auth
router.post('/google', async (req, res) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No credential provided' });

    try {
        console.log(`Verifying Google Token with Client ID: ${GOOGLE_CLIENT_ID}`);
        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log("Google Auth Success:", payload.email);
        const { email, name, picture, sub: googleId } = payload;

        // Check if user exists
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });

            if (user) {
                // User exists -> Login
                
                // Optional: Update Google ID if missing
                // db.run(`UPDATE users SET google_id = ? WHERE id = ?`, [googleId, user.id]);

                const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
                return res.status(200).json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        credits: user.credits,
                        plan: user.plan,
                        role: user.role
                    }
                });
            } else {
                // User does not exist -> Register
                // Generate random password for DB constraints
                const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
                const hashedPassword = bcrypt.hashSync(randomPassword, 8);

                db.run(`INSERT INTO users (name, email, password, credits, plan, role) VALUES (?, ?, ?, 5, 'free', 'user')`, 
                    [name, email, hashedPassword], 
                    function(err) {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        const newUserId = this.lastID;
                        const token = jwt.sign({ id: newUserId }, JWT_SECRET, { expiresIn: '24h' });
                        
                        return res.status(201).json({
                            token,
                            user: {
                                id: newUserId,
                                name: name,
                                email: email,
                                credits: 5,
                                plan: 'free',
                                role: 'user'
                            }
                        });
                });
            }
        });

    } catch (e) {
        console.error("Google Auth Error:", e);
        res.status(400).json({ error: 'Invalid Google Token' });
    }
});

// Register
router.post('/register', (req, res) => {
    let { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    // Normalize email
    email = email.trim().toLowerCase();

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: err.message });
        }

        const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id: this.lastID, name, email, credits: 5, plan: 'free', role: 'user' } });
    });
});

// Login
router.post('/login', (req, res) => {
    let { email, password } = req.body;
    
    // Normalize email
    if (email) email = email.trim().toLowerCase();

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ token: null, error: 'Invalid password' });

        // Update tracking info
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
        const location = 'Unknown'; // Placeholder for now
        const now = new Date().toISOString();

        db.run(`UPDATE users SET last_login = ?, ip = ?, location = ? WHERE id = ?`, [now, ip, location, user.id]);

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                credits: user.credits, 
                plan: user.plan,
                role: user.role
            } 
        });
    });
});

// Verify Email (Mock)
router.post('/verify-email', (req, res) => {
    const { token } = req.body;
    // In a real app, verify the token and update user status
    res.status(200).json({ message: 'Email verified successfully' });
});

// Forgot Password (Mock)
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    // In a real app, send email with reset token
    res.status(200).json({ message: 'Password reset link sent to your email' });
});

// Reset Password (Mock)
router.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    // In a real app, verify token and update password
    res.status(200).json({ message: 'Password has been reset successfully' });
});

// Public Stats - MOVED TO server.js or public routes
// router.get('/public/stats', (req, res) => { ... });

module.exports = router;
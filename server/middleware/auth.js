const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { verifyFirebaseToken } = require('../services/firebaseAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_prod';
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
const REQUIRE_EMAIL_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

function getToken(req) {
    const headerAuth = req.headers['authorization'];
    const bearer = headerAuth && headerAuth.startsWith('Bearer ') ? headerAuth.slice(7) : null;
    return req.headers['x-access-token'] || bearer;
}

function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
}

function createUserFromFirebase(email, name, firebaseUid, emailVerified) {
    return new Promise((resolve, reject) => {
        const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
        db.run(
            `INSERT INTO users (name, email, password, role, plan, credits, email_verified, firebase_uid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name || 'Firebase User', email, 'firebase', role, 'free', 3, emailVerified ? 1 : 0, firebaseUid || null],
            function (err) {
                if (err) return reject(err);
                db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err2, row) => {
                    if (err2) return reject(err2);
                    resolve(row);
                });
            }
        );
    });
}

function updateLastLogin(userId) {
    db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [userId]);
}

async function verifyAuth(req, res, next) {
    const token = getToken(req);
    if (!token) return res.status(403).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        db.get('SELECT blocked, email_verified FROM users WHERE id = ?', [req.userId], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row && row.blocked) return res.status(403).json({ error: 'Account blocked' });
            if (REQUIRE_EMAIL_VERIFICATION && row && Number(row.email_verified) !== 1) return res.status(403).json({ error: 'Email not verified' });
            if (!REQUIRE_EMAIL_VERIFICATION && row && Number(row.email_verified) !== 1) {
                db.run('UPDATE users SET email_verified = 1 WHERE id = ?', [req.userId]);
            }
            updateLastLogin(req.userId);
            return next();
        });
        return;
    } catch {}

    const firebasePayload = await verifyFirebaseToken(token);
    if (!firebasePayload) return res.status(401).json({ error: 'Unauthorized' });
    if (REQUIRE_EMAIL_VERIFICATION && !firebasePayload.email_verified) return res.status(403).json({ error: 'Email not verified' });

    const email = (firebasePayload.email || '').toLowerCase();
    if (!email) return res.status(401).json({ error: 'Unauthorized' });

    try {
        let user = await getUserByEmail(email);
        if (!user) {
            user = await createUserFromFirebase(email, firebasePayload.name, firebasePayload.user_id, firebasePayload.email_verified);
        }
        if (user.blocked) return res.status(403).json({ error: 'Account blocked' });
        if (!user.email_verified && firebasePayload.email_verified) {
            db.run('UPDATE users SET email_verified = 1 WHERE id = ?', [user.id]);
        }
        if (!REQUIRE_EMAIL_VERIFICATION && !user.email_verified) {
            db.run('UPDATE users SET email_verified = 1 WHERE id = ?', [user.id]);
        }
        req.userId = user.id;
        updateLastLogin(req.userId);
        return next();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

function verifyAdmin(req, res, next) {
    verifyAuth(req, res, () => {
        db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, user) => {
            if (err || !user) return res.status(401).json({ error: 'Unauthorized' });
            if (user.role !== 'admin') return res.status(403).json({ error: 'Requires Admin Role' });
            return next();
        });
    });
}

module.exports = { verifyAuth, verifyAdmin };

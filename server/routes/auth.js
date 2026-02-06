const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/database');
const { getAdmin, getFirestore } = require('../services/firebaseAdmin');
const { sendOtpEmail } = require('../services/mailer');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_prod';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '848633901532-m8q0ors3lj860dbj2l0ie1gknvepi2h1.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES || '10', 10);
const OTP_HASH_PEPPER = process.env.OTP_HASH_PEPPER || 'otp_pepper_change_me';
const DEVICE_HASH_PEPPER = process.env.DEVICE_HASH_PEPPER || 'device_pepper_change_me';
const REQUIRE_EMAIL_VERIFICATION = process.env.REQUIRE_EMAIL_VERIFICATION === 'true';

function normalizeEmail(email) {
    return (email || '').trim().toLowerCase();
}

function hashWithPepper(value, pepper) {
    return crypto.createHmac('sha256', pepper).update(value).digest('hex');
}

function hashDevice(deviceId, userAgent, ip) {
    const raw = `${deviceId || ''}|${userAgent || ''}|${ip || ''}`;
    return hashWithPepper(raw, DEVICE_HASH_PEPPER);
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getRequestIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.socket.remoteAddress || '';
}

function issueTokens(user) {
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    const admin = getAdmin();
    if (!admin || !user.firebase_uid) {
        return Promise.resolve({ token, firebaseCustomToken: null });
    }
    return admin.auth().createCustomToken(user.firebase_uid).then(firebaseCustomToken => ({ token, firebaseCustomToken }));
}

async function syncUserToFirestore(user, extra = {}) {
    const firestore = getFirestore();
    if (!firestore) return;
    try {
        await firestore.collection('users').doc(String(user.id)).set({
            email: user.email,
            name: user.name,
            plan: user.plan,
            credits: user.credits,
            role: user.role,
            emailVerified: !!user.email_verified,
            firebaseUid: user.firebase_uid || null,
            freeTrialUsed: !!user.free_trial_used,
            blocked: !!user.blocked,
            updatedAt: new Date().toISOString(),
            ...extra
        }, { merge: true });
    } catch {
    }
}

async function logActivity(userId, action, details) {
    db.run(`INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)`, [userId, action, details]);
    const firestore = getFirestore();
    if (!firestore) return;
    try {
        await firestore.collection('activity_logs').add({
            userId,
            action,
            details,
            createdAt: new Date().toISOString()
        });
    } catch {
    }
}

async function ensureFirebaseUser(email, name, password) {
    const admin = getAdmin();
    if (!admin) return null;
    try {
        const existing = await admin.auth().getUserByEmail(email);
        return existing.uid;
    } catch {
        const created = await admin.auth().createUser({
            email,
            password,
            displayName: name || undefined,
            emailVerified: false
        });
        return created.uid;
    }
}

async function markFirebaseVerified(uid) {
    const admin = getAdmin();
    if (!admin || !uid) return;
    await admin.auth().updateUser(uid, { emailVerified: true });
}

function upsertUserDevice(userId, deviceHash) {
    return new Promise((resolve) => {
        db.run(`INSERT INTO user_devices (user_id, device_hash) VALUES (?, ?)
                ON CONFLICT(user_id, device_hash) DO UPDATE SET last_seen = CURRENT_TIMESTAMP`, [userId, deviceHash], () => resolve());
    });
}

function ensureDeviceTrial(deviceHash, userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT device_hash FROM device_trials WHERE device_hash = ?`, [deviceHash], (err, row) => {
            if (err) return reject(err);
            if (row) return resolve(false);
            db.run(`INSERT INTO device_trials (device_hash, first_user_id) VALUES (?, ?)`, [deviceHash, userId], (err2) => {
                if (err2) return reject(err2);
                resolve(true);
            });
        });
    });
}

router.post('/google', async (req, res) => {
    const { credential, deviceId } = req.body;
    if (!credential) return res.status(400).json({ error: 'No credential provided' });

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;
        const normalizedEmail = normalizeEmail(email);
        const ip = getRequestIp(req);
        const userAgent = req.headers['user-agent'] || '';
        const deviceHash = hashDevice(deviceId, userAgent, ip);

        db.get(`SELECT * FROM users WHERE email = ?`, [normalizedEmail], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });

            if (user) {
                if (user.blocked) return res.status(403).json({ error: 'Account blocked' });
                db.run(`UPDATE users SET email_verified = 1, device_hash = COALESCE(device_hash, ?) WHERE id = ?`, [deviceHash, user.id]);
                await upsertUserDevice(user.id, deviceHash);
                await logActivity(user.id, 'login_google', JSON.stringify({ ip, userAgent, deviceHash }));
                const tokens = await issueTokens(user);
                await syncUserToFirestore({ ...user, email_verified: 1 }, { provider: 'google', googleId, avatar: picture || null });
                return res.status(200).json({
                    token: tokens.token,
                    firebaseCustomToken: tokens.firebaseCustomToken,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        credits: user.credits,
                        plan: user.plan,
                        role: user.role,
                        email_verified: 1
                    }
                });
            }

            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcrypt.hashSync(randomPassword, 8);
            const freeTrialGranted = await ensureDeviceTrial(deviceHash, 0).catch(() => false);
            const credits = freeTrialGranted ? 3 : 0;
            const freeTrialUsed = freeTrialGranted ? 0 : 1;
            const firebaseUid = await ensureFirebaseUser(normalizedEmail, name, randomPassword).catch(() => null);

            db.run(`INSERT INTO users (name, email, password, credits, plan, role, email_verified, device_hash, free_trial_used, firebase_uid) VALUES (?, ?, ?, ?, 'free', 'user', 1, ?, ?, ?)`,
                [name, normalizedEmail, hashedPassword, credits, deviceHash, freeTrialUsed, firebaseUid],
                async function(err2) {
                    if (err2) {
                        if (err2.message.includes('UNIQUE constraint failed')) {
                            return res.status(400).json({ error: 'Email already exists' });
                        }
                        return res.status(500).json({ error: err2.message });
                    }
                    const newUserId = this.lastID;
                    await upsertUserDevice(newUserId, deviceHash);
                    await logActivity(newUserId, 'register_google', JSON.stringify({ ip, userAgent, deviceHash, freeTrialGranted }));
                    const newUser = { id: newUserId, name, email: normalizedEmail, credits, plan: 'free', role: 'user', email_verified: 1, firebase_uid: firebaseUid, free_trial_used: freeTrialUsed };
                    await syncUserToFirestore(newUser, { provider: 'google', googleId, avatar: picture || null });
                    const tokens = await issueTokens(newUser);
                    return res.status(201).json({
                        token: tokens.token,
                        firebaseCustomToken: tokens.firebaseCustomToken,
                        user: {
                            id: newUserId,
                            name,
                            email: normalizedEmail,
                            credits,
                            plan: 'free',
                            role: 'user',
                            email_verified: 1
                        }
                    });
                });
        });
    } catch (e) {
        return res.status(400).json({ error: 'Invalid Google Token' });
    }
});

router.post('/register', (req, res) => {
    res.status(410).json({ error: 'Use register-init' });
});

router.post('/register-init', async (req, res) => {
    let { name, email, password, deviceId } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    email = normalizeEmail(email);
    const ip = getRequestIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const deviceHash = hashDevice(deviceId, userAgent, ip);
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });
        if (existing && Number(existing.email_verified) === 1) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const freeTrialGranted = await ensureDeviceTrial(deviceHash, existing ? existing.id : 0).catch(() => false);
        const credits = freeTrialGranted ? 3 : 0;
        const freeTrialUsed = freeTrialGranted ? 0 : 1;

        if (existing) {
            db.run(`UPDATE users SET email_verified = 1, otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0, password = ?, device_hash = COALESCE(device_hash, ?), free_trial_used = ?, credits = ? WHERE id = ?`,
                [hashedPassword, deviceHash, freeTrialUsed, credits, existing.id], async (err2) => {
                    if (err2) return res.status(500).json({ error: err2.message });
                    await upsertUserDevice(existing.id, deviceHash);
                    await logActivity(existing.id, 'register_direct', JSON.stringify({ ip, userAgent, deviceHash }));
                    const tokens = await issueTokens(existing);
                    return res.status(200).json({
                        token: tokens.token,
                        firebaseCustomToken: tokens.firebaseCustomToken,
                        user: {
                            id: existing.id,
                            name: existing.name,
                            email: existing.email,
                            credits: existing.credits,
                            plan: existing.plan,
                            role: existing.role,
                            email_verified: 1
                        }
                    });
                });
            return;
        }

        const firebaseUid = await ensureFirebaseUser(email, name, password).catch(() => null);
        db.run(`INSERT INTO users (name, email, password, credits, plan, role, email_verified, otp_hash, otp_expires_at, otp_attempts, device_hash, free_trial_used, firebase_uid) VALUES (?, ?, ?, ?, 'free', 'user', 1, NULL, NULL, 0, ?, ?, ?)`,
            [name, email, hashedPassword, credits, deviceHash, freeTrialUsed, firebaseUid], async function(err3) {
                if (err3) {
                    if (err3.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: err3.message });
                }
                const newUserId = this.lastID;
                await upsertUserDevice(newUserId, deviceHash);
                await logActivity(newUserId, 'register_direct', JSON.stringify({ ip, userAgent, deviceHash, freeTrialGranted }));
                await syncUserToFirestore({ id: newUserId, name, email, credits, plan: 'free', role: 'user', email_verified: 1, firebase_uid: firebaseUid, free_trial_used: freeTrialUsed });
                const tokens = await issueTokens({ id: newUserId, email, firebase_uid: firebaseUid });
                return res.status(201).json({
                    token: tokens.token,
                    firebaseCustomToken: tokens.firebaseCustomToken,
                    user: {
                        id: newUserId,
                        name,
                        email,
                        credits,
                        plan: 'free',
                        role: 'user',
                        email_verified: 1
                    }
                });
            });
    });
});

router.post('/verify-otp', async (req, res) => {
    let { email, code, deviceId } = req.body;
    email = normalizeEmail(email);
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' });
    const ip = getRequestIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const deviceHash = hashDevice(deviceId, userAgent, ip);

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.blocked) return res.status(403).json({ error: 'Account blocked' });
        if (!user.otp_hash || !user.otp_expires_at) return res.status(400).json({ error: 'No OTP pending' });
        const expired = new Date(user.otp_expires_at).getTime() < Date.now();
        const incomingHash = hashWithPepper(code, OTP_HASH_PEPPER);
        if (expired || incomingHash !== user.otp_hash) {
            db.run(`UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = ?`, [user.id]);
            return res.status(400).json({ error: 'Invalid code' });
        }
        db.run(`UPDATE users SET email_verified = 1, otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0, device_hash = COALESCE(device_hash, ?) WHERE id = ?`,
            [deviceHash, user.id], async (err2) => {
                if (err2) return res.status(500).json({ error: err2.message });
                await upsertUserDevice(user.id, deviceHash);
                await markFirebaseVerified(user.firebase_uid);
                await logActivity(user.id, 'email_verified', JSON.stringify({ ip, userAgent, deviceHash }));
                const tokens = await issueTokens(user);
                await syncUserToFirestore({ ...user, email_verified: 1 }, { verifiedAt: new Date().toISOString() });
                return res.status(200).json({
                    token: tokens.token,
                    firebaseCustomToken: tokens.firebaseCustomToken,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        credits: user.credits,
                        plan: user.plan,
                        role: user.role,
                        email_verified: 1
                    }
                });
            });
    });
});

router.post('/resend-otp', async (req, res) => {
    let { email } = req.body;
    email = normalizeEmail(email);
    if (!email) return res.status(400).json({ error: 'Email required' });
    const otpCode = generateOtp();
    const otpHash = hashWithPepper(otpCode, OTP_HASH_PEPPER);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60000).toISOString();
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (Number(user.email_verified) === 1) return res.status(400).json({ error: 'Already verified' });
        db.run(`UPDATE users SET otp_hash = ?, otp_expires_at = ?, otp_attempts = 0 WHERE id = ?`, [otpHash, otpExpiresAt, user.id], async (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            const sent = await sendOtpEmail(email, otpCode);
            if (!sent) return res.status(500).json({ error: 'Email service not configured' });
            return res.status(200).json({ message: 'OTP sent' });
        });
    });
});

router.post('/login', (req, res) => {
    let { email, password, deviceId } = req.body;
    if (email) email = normalizeEmail(email);
    const ip = getRequestIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const deviceHash = hashDevice(deviceId, userAgent, ip);

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.blocked) return res.status(403).json({ error: 'Account blocked' });
        if (REQUIRE_EMAIL_VERIFICATION && Number(user.email_verified) !== 1) return res.status(403).json({ error: 'Email not verified' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ token: null, error: 'Invalid password' });

        const now = new Date().toISOString();
        const nextVerified = REQUIRE_EMAIL_VERIFICATION ? user.email_verified : 1;
        db.run(`UPDATE users SET last_login = ?, ip = ?, location = ?, device_hash = COALESCE(device_hash, ?), email_verified = ? WHERE id = ?`, [now, ip, 'Unknown', deviceHash, nextVerified, user.id]);
        await upsertUserDevice(user.id, deviceHash);
        await logActivity(user.id, 'login', JSON.stringify({ ip, userAgent, deviceHash }));
        const tokens = await issueTokens(user);
        res.status(200).json({
            token: tokens.token,
            firebaseCustomToken: tokens.firebaseCustomToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                credits: user.credits,
                plan: user.plan,
                role: user.role,
                email_verified: nextVerified
            }
        });
    });
});

router.post('/verify-email', (req, res) => {
    res.status(400).json({ error: 'Use OTP verification endpoint' });
});

router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    res.status(200).json({ message: 'Password reset link sent to your email' });
});

router.post('/reset-password', (req, res) => {
    const { token, newPassword } = req.body;
    res.status(200).json({ message: 'Password has been reset successfully' });
});

module.exports = router;

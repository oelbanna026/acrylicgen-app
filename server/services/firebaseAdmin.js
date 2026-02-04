const admin = require('firebase-admin');
const fs = require('fs');

let initialized = false;

function loadServiceAccount() {
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (rawJson && rawJson.trim().startsWith('{')) {
        return JSON.parse(rawJson);
    }

    const base64Json = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (base64Json) {
        const decoded = Buffer.from(base64Json, 'base64').toString('utf8');
        return JSON.parse(decoded);
    }

    const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (jsonPath && fs.existsSync(jsonPath)) {
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }

    return null;
}

function getAdmin() {
    if (initialized) return admin;
    const serviceAccount = loadServiceAccount();
    if (!serviceAccount) return null;
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    initialized = true;
    return admin;
}

async function verifyFirebaseToken(idToken) {
    const app = getAdmin();
    if (!app) return null;
    try {
        return await admin.auth().verifyIdToken(idToken);
    } catch {
        return null;
    }
}

module.exports = { verifyFirebaseToken };

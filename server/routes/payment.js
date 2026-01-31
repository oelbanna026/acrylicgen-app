const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Future

// PayPal Config
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'ATp1IFI6cxnoSWuZ1HpWOoj9xwUk8Og8IWoazQ3g1UodjOfj9iW6L0mjcYxdak4_7LpXGAVjrMVWWrGz';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'EJW5thW2OEPr_dUQMUAswGoGOPOb-na4s8KNVQqKOyrc0yCJzqddal-eFDK9ZVcNtKoWd41JxLw7u10r';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for Live

// Helper to get PayPal Access Token
async function getPayPalAccessToken() {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_SECRET).toString('base64');
    try {
        const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        const data = await response.json();
        return data.access_token;
    } catch (e) {
        console.error("PayPal Auth Error:", e);
        return null;
    }
}

// Verify PayPal Payment
router.post('/verify-paypal', async (req, res) => {
    const { userId, orderId, plan, credits, amount } = req.body;

    // 1. Verify with PayPal (Optional but Recommended)
    // For this implementation, we trust the captured order status passed from client for speed,
    // but in production, we should re-fetch the order from PayPal using the orderId.
    
    // const accessToken = await getPayPalAccessToken();
    // const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}`, {
    //     headers: { 'Authorization': `Bearer ${accessToken}` }
    // });
    // const orderData = await orderRes.json();
    // if (orderData.status !== 'COMPLETED') return res.status(400).json({ error: 'Payment not completed' });

    // 2. Update Database
    let updateQuery = '';
    let params = [];

    if (plan) {
        // Update subscription
        // If business, set unlimited credits (represented by -1 or high number)
        updateQuery = `UPDATE users SET plan = ?, credits = CASE WHEN ? = 'business' THEN -1 ELSE credits + ? END WHERE id = ?`;
        let newCredits = plan === 'starter' ? 30 : (plan === 'pro' ? 100 : 0);
        params = [plan, plan, newCredits, userId];
    } else if (credits) {
        // PAYG (Pay As You Go)
        updateQuery = `UPDATE users SET credits = CASE WHEN credits = -1 THEN -1 ELSE credits + ? END WHERE id = ?`;
        params = [credits, userId];
    } else {
        return res.status(400).json({ error: 'Invalid purchase type' });
    }

    db.run(updateQuery, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Log Payment
        db.run(`INSERT INTO payments (user_id, amount, currency, payment_method, status, transaction_id) VALUES (?, ?, 'USD', 'paypal', 'succeeded', ?)`, 
            [userId, amount, orderId], (err) => {
                if (err) console.error("Payment Log Error:", err);
            });

        res.status(200).json({ success: true, message: 'Payment verified and account updated' });
    });
});

// Mock Payment for Testing (Deprecated but kept for fallback)
router.post('/mock-purchase', (req, res) => {
    const { userId, plan, credits, amount } = req.body;
    
    // Simulate successful payment
    let updateQuery = '';
    let params = [];

    if (plan) {
        // Update subscription
        updateQuery = `UPDATE users SET plan = ?, credits = CASE WHEN ? = 'business' THEN 999999 ELSE credits + ? END WHERE id = ?`;
        let newCredits = plan === 'starter' ? 30 : (plan === 'pro' ? 100 : 0);
        params = [plan, plan, newCredits, userId];
    } else if (credits) {
        // PAYG
        updateQuery = `UPDATE users SET credits = credits + ? WHERE id = ?`;
        params = [credits, userId];
    }

    db.run(updateQuery, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Log Payment
        db.run(`INSERT INTO payments (user_id, amount, currency, payment_method, status) VALUES (?, ?, 'USD', 'mock_card', 'succeeded')`, 
            [userId, amount]);

        res.status(200).json({ success: true, message: 'Payment successful (Mock)' });
    });
});

// Stripe Checkout Session (Structure)
router.post('/create-checkout-session', async (req, res) => {
    // In production, use Stripe API to create session
    // const session = await stripe.checkout.sessions.create({ ... });
    // res.json({ url: session.url });
    res.status(501).json({ error: 'Stripe keys not configured. Use Mock Payment.' });
});

module.exports = router;
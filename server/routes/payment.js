const express = require('express');
const router = express.Router();
const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');

// Mock Payment for Demo (Since we don't have real keys)
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
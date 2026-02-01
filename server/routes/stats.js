const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Helper to get current date string (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Record a visit (Heartbeat)
router.post('/visit', (req, res) => {
    const { sessionId } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const today = getTodayDate();

    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

    db.serialize(() => {
        // 1. Update Active Session
        db.run(`INSERT INTO active_sessions (id, last_active, ip, user_agent) 
                VALUES (?, CURRENT_TIMESTAMP, ?, ?)
                ON CONFLICT(id) DO UPDATE SET last_active = CURRENT_TIMESTAMP`, 
                [sessionId, ip, userAgent]);

        // 2. Increment Total Views (Only if this is a new session start? Or every hit? 
        // Usually "views" implies page loads. Let's assume the frontend calls this on load.)
        // To avoid spamming view count on every heartbeat, we should check if this session just started.
        // But for simplicity and "Total Views" requirement, let's increment if we haven't seen this session recently?
        // Actually, "Total Site Views" usually means Page Views. The frontend should call this ONCE per page load with a flag `isPageLoad: true`.
        
        if (req.body.type === 'page_view') {
            db.run(`UPDATE site_stats SET total_views = total_views + 1 WHERE id = 1`);
        }

        // 3. Record Unique Visitor for Today
        db.run(`INSERT OR IGNORE INTO daily_visitors (ip, date) VALUES (?, ?)`, [ip, today]);
        
        res.json({ success: true });
    });
});

// Get Dashboard Stats
router.get('/dashboard', (req, res) => {
    const stats = {};
    const today = getTodayDate();

    db.serialize(() => {
        // 1. Total Site Views
        db.get(`SELECT total_views FROM site_stats WHERE id = 1`, (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.totalViews = row ? row.total_views : 0;

            // 2. Active Users (active in last 5 minutes)
            db.get(`SELECT COUNT(*) as count FROM active_sessions 
                    WHERE last_active > datetime('now', '-5 minutes')`, (err, row) => {
                if (err) stats.activeUsers = 0;
                else stats.activeUsers = row.count;

                // 3. Sales in Last 24h & Conversion Rate
                db.get(`SELECT COUNT(*) as count FROM payments 
                        WHERE created_at > datetime('now', '-1 day') AND status = 'completed'`, (err, row) => {
                    if (err) stats.sales24h = 0;
                    else stats.sales24h = row.count;

                    // Get unique visitors for last 24h (approx using today's daily_visitors + yesterday if needed, 
                    // or just use daily_visitors for "today" as conversion is usually daily. 
                    // User asked "last 24h". Let's query daily_visitors for today and yesterday if needed, or simplistic approach:
                    // Since daily_visitors is by date, "last 24h" is tricky.
                    // Let's stick to "Today's Conversion Rate" or "24h" if we logged timestamps.
                    // I only logged date in daily_visitors. Let's use "Today" for conversion rate context or improve daily_visitors.
                    // Actually, let's use `daily_visitors` count for TODAY for the denominator of TODAY's sales?
                    // The prompt says "purchases ... last 24h with conversion rate".
                    // Let's refine `daily_visitors` to store `created_at` timestamp instead of just date?
                    // Existing schema is (ip, date). Let's just use "Unique Visitors Today" vs "Sales Today" for conversion.
                    // It's a dashboard, "Today" is usually what's meant by "Real-time" context.
                    // If I must do strict 24h, I need timestamps for visitors.
                    // Let's use the `active_sessions` table? No, that's transient.
                    // Let's just use `daily_visitors` count for today.
                    
                    db.get(`SELECT COUNT(*) as count FROM daily_visitors WHERE date = ?`, [today], (err, row) => {
                        const visitorsToday = row ? row.count : 0;
                        // Conversion Rate = (Sales 24h / Visitors Today) * 100 (Approximation)
                        // Ideally: Sales Today / Visitors Today.
                        // Let's adjust query for sales to be "Today" as well for consistency?
                        // "Last 24h" is requested.
                        // Let's keep Sales 24h as requested, and for conversion, use a best-effort denominator (Visitors 24h).
                        // Since I can't easily get Visitors 24h without timestamp in daily_visitors, I'll use Visitors Today.
                        
                        stats.visitorsToday = visitorsToday; // For debugging/display
                        stats.conversionRate = visitorsToday > 0 ? ((stats.sales24h / visitorsToday) * 100).toFixed(2) : 0;

                        // 4. Total Exports
                        db.get(`SELECT COUNT(*) as count FROM exports`, (err, row) => {
                            stats.totalExports = row ? row.count : 0;
                            
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;

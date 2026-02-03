const express = require('express');
const { GoogleAuth } = require('google-auth-library');
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

const getDbScalar = (sql, params = [], field = 'count') => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(0);
        if (row[field] !== undefined) return resolve(row[field]);
        return resolve(0);
    });
});

const getGa4Stats = async () => {
    const propertyId = process.env.GA4_PROPERTY_ID;
    const sa = process.env.GA4_SERVICE_ACCOUNT_JSON;
    if (!propertyId || !sa) return null;

    let credentials;
    try {
        credentials = JSON.parse(Buffer.from(sa, 'base64').toString('utf8'));
    } catch (e) {
        return null;
    }

    const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/analytics.readonly']
    });

    const client = await auth.getClient();
    const baseUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}`;

    const realtime = await client.request({
        url: `${baseUrl}:runRealtimeReport`,
        method: 'POST',
        data: {
            metrics: [{ name: 'activeUsers' }]
        }
    });

    const report = await client.request({
        url: `${baseUrl}:runReport`,
        method: 'POST',
        data: {
            dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'totalUsers' },
                { name: 'conversions' }
            ]
        }
    });

    const realtimeRows = realtime.data?.rows || [];
    const reportRows = report.data?.rows || [];

    const activeUsers = realtimeRows[0]?.metricValues?.[0]?.value ? parseInt(realtimeRows[0].metricValues[0].value, 10) : 0;
    const totalViews = reportRows[0]?.metricValues?.[0]?.value ? parseInt(reportRows[0].metricValues[0].value, 10) : 0;
    const users24h = reportRows[0]?.metricValues?.[1]?.value ? parseInt(reportRows[0].metricValues[1].value, 10) : 0;
    const conversions24h = reportRows[0]?.metricValues?.[2]?.value ? parseInt(reportRows[0].metricValues[2].value, 10) : 0;

    return { activeUsers, totalViews, users24h, conversions24h };
};

// Get Dashboard Stats
router.get('/dashboard', async (req, res) => {
    const stats = {
        totalViews: 0,
        activeUsers: 0,
        sales24h: 0,
        conversionRate: 0,
        totalExports: 0
    };

    try {
        const [sales24h, totalExports] = await Promise.all([
            getDbScalar(`SELECT COUNT(*) as count FROM payments WHERE created_at > datetime('now', '-1 day') AND status = 'completed'`),
            getDbScalar(`SELECT COUNT(*) as count FROM exports`)
        ]);

        stats.sales24h = sales24h;
        stats.totalExports = totalExports;

        const ga4 = await getGa4Stats();
        if (ga4) {
            stats.totalViews = ga4.totalViews;
            stats.activeUsers = ga4.activeUsers;
            const denom = ga4.users24h || 0;
            stats.conversionRate = denom > 0 ? ((stats.sales24h / denom) * 100).toFixed(2) : 0;
            return res.json(stats);
        }

        const today = getTodayDate();
        const totalViews = await getDbScalar(`SELECT total_views FROM site_stats WHERE id = 1`, [], 'total_views');
        const activeUsers = await getDbScalar(`SELECT COUNT(*) as count FROM active_sessions WHERE last_active > datetime('now', '-5 minutes')`);
        const visitorsToday = await getDbScalar(`SELECT COUNT(*) as count FROM daily_visitors WHERE date = ?`, [today]);

        stats.totalViews = totalViews;
        stats.activeUsers = activeUsers;
        stats.conversionRate = visitorsToday > 0 ? ((stats.sales24h / visitorsToday) * 100).toFixed(2) : 0;
        return res.json(stats);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const db = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const exportRoutes = require('./routes/export');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Static Files (Serve the frontend)
app.use(express.static(path.join(__dirname, '../src')));
// Serve dist if production
// app.use(express.static(path.join(__dirname, '../dist')));

// Routes (Support both /api and root paths to handle Nginx proxying correctly)
const apiRouter = express.Router();
app.use('/api', apiRouter);
app.use('/', apiRouter); // Alias for when Nginx strips /api

apiRouter.use('/auth', authRoutes);
apiRouter.use('/user', userRoutes);
apiRouter.use('/export', exportRoutes);
apiRouter.use('/payment', paymentRoutes);
apiRouter.use('/admin', adminRoutes);

// Public Stats Route (Moved from auth.js)
apiRouter.get('/public/stats', (req, res) => {
    const stats = {};
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalUsers = row.count;
        
        db.get('SELECT COUNT(*) as count FROM exports', (err, row) => {
            if (err) stats.totalExports = 0;
            else stats.totalExports = row.count;
            
            stats.activeUsers = Math.floor(Math.random() * 20) + 5; // Mock
            res.status(200).json(stats);
        });
    });
});

// SPA Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

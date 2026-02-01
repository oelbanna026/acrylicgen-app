require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const db = require('./config/database');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const exportRoutes = require('./routes/export');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
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
apiRouter.use('/stats', statsRoutes);

// SPA Fallback with Dynamic SEO Injection
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../src/index.html');
    
    // Read index.html
    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
        if (err) {
            console.error('Error reading index.html', err);
            return res.status(500).send('Server Error');
        }

        // Default Meta
        let title = 'Acrylic Designer Pro | Free Laser Cutting SVG & DXF Generator';
        let description = 'Free online tool to generate laser cutting files (SVG/DXF) for acrylic sheets. Auto-nesting, cost calculation, and custom box designs.';
        let url = 'https://acrylicgen-app.com' + req.url;

        // 1. Box Generator Pages (Programmatic SEO)
        // URL Pattern: /box/10x10x5 (Width x Height x Depth)
        const boxMatch = req.url.match(/^\/box\/(\d+)x(\d+)x(\d+)$/);
        if (boxMatch) {
            const [_, w, h, d] = boxMatch;
            title = `Acrylic Box Design ${w}x${h}x${d} cm | Free Laser Cut File`;
            description = `Download free laser cutting SVG/DXF plan for an acrylic box with dimensions ${w}cm x ${h}cm x ${d}cm. Auto-calculated kerf and nesting included.`;
        }

        // 2. Shape Pages
        // URL Pattern: /shape/hexagon
        if (req.url.includes('/shape/')) {
            const shape = req.url.split('/shape/')[1];
            title = `${shape.charAt(0).toUpperCase() + shape.slice(1)} Acrylic Shape Generator | Free SVG`;
            description = `Create custom ${shape} shapes for laser cutting. Calculate costs and export DXF instantly.`;
        }

        // Inject into HTML
        htmlData = htmlData
            .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
            .replace(/content="[^"]*?"\s+name="description"/, `content="${description}" name="description"`)
            .replace(/content="[^"]*?"\s+property="og:title"/, `content="${title}" property="og:title"`)
            .replace(/content="[^"]*?"\s+property="og:description"/, `content="${description}" property="og:description"`)
            .replace(/content="[^"]*?"\s+property="twitter:title"/, `content="${title}" property="twitter:title"`)
            .replace(/content="[^"]*?"\s+property="twitter:description"/, `content="${description}" property="twitter:description"`)
            .replace(/href="https:\/\/acrylicgen-app.com\/"/, `href="${url}"`); // Update Canonical if needed, but usually we keep canonical to root for app pages unless it's unique content.
            // For programmatic pages, we SHOULD have unique canonicals.
        
        if (boxMatch || req.url.includes('/shape/')) {
             htmlData = htmlData.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${url}" />`);
        }

        res.send(htmlData);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

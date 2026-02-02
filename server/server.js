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

// Serve Admin Dashboard
const adminPath = path.join(__dirname, '../dist/admin');
if (fs.existsSync(adminPath)) {
    // 1. Serve Static Assets (_next) with cache
    app.use('/admin/_next', express.static(path.join(adminPath, '_next'), {
        maxAge: '1y',
        immutable: true
    }));

    // 2. Serve other static files (HTML, etc) with NO cache to ensure updates are seen immediately
    app.use('/admin', express.static(adminPath, {
        cacheControl: false,
        etag: false,
        lastModified: false
    }));

    // 3. Handle client-side routing - Force NO CACHE for index.html
    app.get('/admin*', (req, res) => {
        // Handle explicit file requests that might have slipped through static middleware
        if (req.path.includes('.')) {
             // Remove /admin prefix but keep the rest of the path
             // Example: /admin/_next/static/css/xxx.css -> /_next/static/css/xxx.css
             // But wait, our adminPath is 'dist/admin', so we need to map correctly.
             
             const relativePath = req.path.replace('/admin', '');
             const requestedFile = path.join(adminPath, relativePath);
             
             if (fs.existsSync(requestedFile)) {
                 return res.sendFile(requestedFile);
             }
        }

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Clear-Site-Data', '"storage", "executionContexts"');
        res.sendFile(path.join(adminPath, 'index.html'));
    });

    // DEBUG ROUTE: List files in admin directory
    app.get('/api/admin-debug-files', (req, res) => {
        const getAllFiles = function(dirPath, arrayOfFiles) {
            files = fs.readdirSync(dirPath)
            arrayOfFiles = arrayOfFiles || []
            files.forEach(function(file) {
                if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                    arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
                } else {
                    arrayOfFiles.push(path.join(dirPath, "/", file))
                }
            })
            return arrayOfFiles
        }
        try {
            const files = getAllFiles(adminPath);
            res.json({ 
                basePath: adminPath, 
                files: files.map(f => f.replace(adminPath, '')) 
            });
        } catch (e) {
            res.status(500).json({ error: e.message, stack: e.stack });
        }
    });
}

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

// -------------------------------------------------------------------------
// Programmatic SEO: Dynamic Sitemap & Directory
// -------------------------------------------------------------------------

// 1. Dynamic Sitemap for Boxes (/sitemap-boxes.xml)
app.get('/sitemap-boxes.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Generate combinations: 10-50cm width, 10-50cm height, 5-30cm depth (step 5)
    // This creates valuable long-tail keywords
    const sizes = [10, 15, 20, 25, 30, 35, 40, 45, 50];
    const depths = [5, 10, 15, 20, 25, 30];

    sizes.forEach(w => {
        sizes.forEach(h => {
            depths.forEach(d => {
                xml += `
    <url>
        <loc>https://acrylicgen-app.com/box/${w}x${h}x${d}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`;
            });
        });
    });

    xml += '</urlset>';
    res.send(xml);
});

// 2. Internal Linking Directory (/designs)
app.get('/designs', (req, res) => {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Popular Acrylic Box Designs | Free Templates</title>
        <meta name="description" content="Browse our collection of free laser cut acrylic box templates. Download SVG and DXF files for hundreds of sizes.">
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; line-height: 1.5; }
            h1 { color: #2563eb; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem; }
            .card { border: 1px solid #e5e7eb; padding: 1rem; border-radius: 0.5rem; text-decoration: none; color: #374151; transition: all 0.2s; }
            .card:hover { border-color: #2563eb; color: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            .dim { font-weight: bold; font-size: 1.1rem; }
            .meta { font-size: 0.875rem; color: #6b7280; }
        </style>
    </head>
    <body>
        <h1>Popular Acrylic Box Designs</h1>
        <p>Select a size to customize and download your laser cutting files instantly.</p>
        <div class="grid">
    `;

    const sizes = [10, 15, 20, 25, 30, 35, 40, 45, 50];
    const depths = [5, 10, 15, 20, 25, 30];

    sizes.forEach(w => {
        sizes.forEach(h => {
            depths.forEach(d => {
                html += `
            <a href="/box/${w}x${h}x${d}" class="card">
                <div class="dim">${w}x${h}x${d} cm</div>
                <div class="meta">Free SVG Plan</div>
            </a>`;
            });
        });
    });

    html += `
        </div>
        <footer style="margin-top: 4rem; text-align: center; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 2rem;">
            <p>&copy; ${new Date().getFullYear()} Acrylic Generator. All rights reserved.</p>
            <p><a href="/">Back to Home</a></p>
        </footer>
    </body>
    </html>
    `;
    
    res.send(html);
});

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

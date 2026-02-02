const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(type, message) {
    const color = colors[type] || colors.reset;
    console.log(`${color}[${type.toUpperCase()}] ${message}${colors.reset}`);
}

async function checkSystem() {
    log('blue', 'Starting System Diagnosis Bot...');
    
    const rootDir = path.resolve(__dirname, '..');
    const indexHtmlPath = path.join(rootDir, 'index.html');
    const srcIndexHtmlPath = path.join(rootDir, 'src', 'index.html');
    const appJsPath = path.join(rootDir, 'src', 'js', 'app.js');

    // 1. Check File Existence
    log('blue', 'Checking critical files...');
    const filesToCheck = [
        indexHtmlPath,
        srcIndexHtmlPath,
        appJsPath,
        path.join(rootDir, 'src', 'css', 'style.css'),
        path.join(rootDir, 'manifest.json')
    ];

    for (const file of filesToCheck) {
        if (fs.existsSync(file)) {
            log('green', `Found: ${path.relative(rootDir, file)}`);
        } else {
            log('red', `MISSING: ${path.relative(rootDir, file)}`);
        }
    }

    // 2. Analyze HTML for broken paths and event handlers
    log('blue', 'Analyzing index.html for issues...');
    if (fs.existsSync(indexHtmlPath)) {
        const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
        
        // Check for old event handlers
        const oldHandlers = ['panView', 'startPan', 'endPan', 'handleWheel'];
        const foundOldHandlers = oldHandlers.filter(h => htmlContent.includes(h));
        
        if (foundOldHandlers.length > 0) {
            log('red', `Found deprecated event handlers in index.html: ${foundOldHandlers.join(', ')}`);
            log('yellow', 'Recommendation: Update index.html to use onStartPan, onMouseMove, onEndPan, onWheel');
        } else {
            log('green', 'Event handlers look up to date.');
        }

        // Check for 404 paths
        if (htmlContent.includes('href="css/style.css"')) {
            log('red', 'Found incorrect CSS path: href="css/style.css". Should be "src/css/style.css"');
        }
        if (htmlContent.includes('src="js/app.js"')) {
            log('red', 'Found incorrect JS path: src="js/app.js". Should be "src/js/app.js"');
        }
    }

    // 3. Analyze app.js syntax (basic)
    log('blue', 'Analyzing app.js...');
    if (fs.existsSync(appJsPath)) {
        const jsContent = fs.readFileSync(appJsPath, 'utf8');
        if (jsContent.includes('onStartPan') && jsContent.includes('onEndPan')) {
            log('green', 'app.js contains correct event handler definitions.');
        } else {
            log('red', 'app.js might be missing core event handlers.');
        }
    }

    log('blue', 'Diagnosis Complete.');
}

checkSystem();

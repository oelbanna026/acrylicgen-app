(function() {
    console.log('Diagnostics Tool Loaded');

    const Diagnostics = {
        logs: [],
        isVisible: false,
        
        init() {
            this.createUI();
            this.interceptConsole();
            
            // Capture global errors
            window.addEventListener('error', (e) => {
                this.log('error', `Uncaught Error: ${e.message} at ${e.filename}:${e.lineno}`);
            });

            window.addEventListener('unhandledrejection', (e) => {
                this.log('error', `Unhandled Promise Rejection: ${e.reason}`);
            });

            // Expose trigger
            window.runDiagnostics = () => this.run();
            window.toggleConsole = () => this.toggleUI();
            
            // Keyboard shortcut (Ctrl + Shift + D)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                    e.preventDefault();
                    this.toggleUI();
                }
            });
        },

        interceptConsole() {
            const methods = ['log', 'warn', 'error', 'info', 'debug'];
            methods.forEach(method => {
                const original = console[method];
                console[method] = (...args) => {
                    // Call original
                    original.apply(console, args);
                    // Log to our tool
                    this.log(method, args.map(a => {
                        try {
                            return typeof a === 'object' ? JSON.stringify(a) : String(a);
                        } catch(e) {
                            return '[Circular/Unserializable]';
                        }
                    }).join(' '));
                };
            });
        },

        log(type, message) {
            const entry = { type, message, time: new Date() };
            this.logs.push(entry);
            // Limit logs to prevent memory issues
            if (this.logs.length > 500) this.logs.shift();
            this.appendLogToUI(entry);
        },

        createUI() {
            const div = document.createElement('div');
            div.id = 'console-inspector';
            div.style.cssText = `
                position: fixed; bottom: 0; left: 0; width: 100%; height: 300px;
                background: rgba(30, 30, 30, 0.95); color: #e0e0e0; z-index: 99999;
                font-family: 'Menlo', 'Monaco', 'Courier New', monospace; font-size: 12px; display: none;
                flex-direction: column; border-top: 2px solid #444; box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
            `;
            
            div.innerHTML = `
                <div style="padding: 8px 15px; background: #252526; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333;">
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <strong style="color: #fff;">Console Inspector</strong>
                        <span style="font-size: 10px; color: #888;">(Ctrl+Alt+D or F9)</span>
                    </div>
                    <div>
                        <button onclick="window.runDiagnostics()" style="background: #0e639c; color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; margin-right: 10px;">Run Diagnostics</button>
                        <button onclick="document.getElementById('console-logs').innerHTML=''; window.Diagnostics.logs=[];" style="background: #444; color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; margin-right: 10px;">Clear</button>
                        <button onclick="window.toggleConsole()" style="background: transparent; color: #aaa; border: none; font-size: 16px; cursor: pointer;">✕</button>
                    </div>
                </div>
                <div id="console-logs" style="flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 4px;"></div>
            `;
            
            document.body.appendChild(div);
        },

        toggleUI() {
            const ui = document.getElementById('console-inspector');
            if (ui) {
                this.isVisible = !this.isVisible;
                ui.style.display = this.isVisible ? 'flex' : 'none';
                if (this.isVisible) {
                    this.renderLogs();
                }
            }
        },

        renderLogs() {
            const container = document.getElementById('console-logs');
            if (!container) return;
            container.innerHTML = '';
            this.logs.forEach(log => this.appendLogToUI(log));
        },

        appendLogToUI(log) {
            if (!this.isVisible) return;
            const container = document.getElementById('console-logs');
            if (!container) return;
            
            const row = document.createElement('div');
            row.style.borderBottom = '1px solid #333';
            row.style.padding = '4px 0';
            row.style.wordBreak = 'break-all';
            
            let color = '#ccc';
            let bg = 'transparent';
            
            if (log.type === 'error') { color = '#f48771'; bg = 'rgba(255,0,0,0.1)'; }
            if (log.type === 'warn') { color = '#cca700'; bg = 'rgba(255,255,0,0.05)'; }
            if (log.type === 'info') color = '#75beff';
            if (log.type === 'debug') color = '#aa66ff';
            
            row.style.color = color;
            row.style.backgroundColor = bg;
            
            const time = log.time.toLocaleTimeString();
            row.innerHTML = `<span style="color: #666; margin-right: 8px;">[${time}]</span><strong style="margin-right: 8px;">[${log.type.toUpperCase()}]</strong><span>${log.message}</span>`;
            
            container.appendChild(row);
            container.scrollTop = container.scrollHeight;
        },

        async run() {
            // Check dependencies
            const report = { errors: [], warnings: [], info: [] };
            
            this.log('info', 'Running Full System Diagnostic...');
            
            // 1. Dependencies
            if (typeof window.Alpine === 'undefined') report.errors.push('Alpine.js missing');
            else report.info.push('Alpine.js loaded');
            
            // 2. Critical DOM
            ['canvas-area', 'sidebar-panel'].forEach(id => {
                if(!document.getElementById(id)) report.warnings.push('Missing DOM: ' + id);
            });
            
            // 3. App State
            try {
                const appEl = document.querySelector('[x-data="app()"]');
                if (appEl && appEl.__x) {
                    const data = appEl.__x.$data;
                    report.info.push('App State Access: OK');
                    if (!data.shapes) report.errors.push('State Corrupt: shapes missing');
                    // Check renamed handlers
                    if (typeof data.onMouseMove !== 'function') report.errors.push('Critical: onMouseMove missing');
                } else {
                    report.warnings.push('Alpine Component not initialized');
                }
            } catch(e) {
                report.errors.push('State Inspection Failed: ' + e.message);
            }
            
            // Show results
            this.showReport(report);
            return report;
        },

        showReport(report) {
            this.log('info', 'Diagnostic Complete. ' + JSON.stringify(report));
            let msg = `DIAGNOSTIC REPORT:\n\nERRORS: ${report.errors.length}\nWARNINGS: ${report.warnings.length}\n\n`;
            if(report.errors.length) msg += "ERRORS:\n" + report.errors.join('\n') + "\n\n";
            if(report.warnings.length) msg += "WARNINGS:\n" + report.warnings.join('\n');
            
            alert(msg);
        }
    };

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Diagnostics.init());
    } else {
        Diagnostics.init();
    }
    
    window.Diagnostics = Diagnostics;
})();
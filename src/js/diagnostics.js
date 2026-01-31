(function() {
    console.log('Diagnostics Tool Loaded');

    const Diagnostics = {
        logs: [],
        
        init() {
            // Capture global errors
            window.addEventListener('error', (e) => {
                this.log('error', `Uncaught Error: ${e.message} at ${e.filename}:${e.lineno}`);
            });

            window.addEventListener('unhandledrejection', (e) => {
                this.log('error', `Unhandled Promise Rejection: ${e.reason}`);
            });

            // Expose trigger
            window.runDiagnostics = () => this.run();
        },

        log(type, message) {
            this.logs.push({ type, message, time: new Date() });
            console.log(`[Diagnostics][${type}]`, message);
        },

        async run() {
            this.logs = []; // Clear previous logs
            this.log('info', 'Starting System Check...');

            const report = {
                errors: [],
                warnings: [],
                info: []
            };

            // 1. Check Dependencies
            if (typeof window.Alpine === 'undefined') report.errors.push('Alpine.js is not loaded');
            else report.info.push('Alpine.js is loaded');

            if (typeof window.app === 'undefined') report.errors.push('App logic (app.js) is not loaded');
            else report.info.push('App logic is loaded');

            if (typeof window.AuthService === 'undefined') report.warnings.push('AuthService is missing (Offline mode?)');
            else report.info.push('AuthService is available');

            // 2. Check DOM Critical Elements
            const criticalIds = ['canvas-area', 'sidebar-panel', 'btn-nesting', 'dimensions-section'];
            criticalIds.forEach(id => {
                if (!document.getElementById(id)) report.warnings.push(`Critical DOM element missing: #${id}`);
            });

            // 3. Check LocalStorage
            try {
                localStorage.setItem('diag_test', '1');
                localStorage.removeItem('diag_test');
                report.info.push('LocalStorage is working');
            } catch (e) {
                report.errors.push('LocalStorage is inaccessible: ' + e.message);
            }

            // 4. Check Backend Connectivity
            try {
                const start = Date.now();
                const res = await fetch('/api/health', { method: 'HEAD' }); // Assuming /api/health exists or just root
                if (res.ok) report.info.push(`Backend reachable (${Date.now() - start}ms)`);
                else report.warnings.push(`Backend returned status ${res.status}`);
            } catch (e) {
                // Try simple ping to root if api fails
                try {
                     const res = await fetch('/', { method: 'HEAD' });
                     if(res.ok) report.info.push('Server reachable (Static only)');
                     else report.warnings.push('Server unreachable');
                } catch(err) {
                    report.errors.push('Network/Server is unreachable');
                }
            }

            // 5. Check Canvas/App State
            try {
                // If app is running, check its state
                const appData = document.querySelector('[x-data="app()"]');
                if (appData && appData.__x) {
                    const data = appData.__x.$data;
                    if (!data.shapes) report.errors.push('App State: Shapes array missing');
                    if (typeof data.handleMouseMove !== 'function') report.errors.push('App Logic: handleMouseMove missing (Critical)');
                } else {
                    report.warnings.push('Cannot access Alpine component data');
                }
            } catch (e) {
                report.errors.push('Failed to inspect App State: ' + e.message);
            }

            this.showReport(report);
            return report;
        },

        showReport(report) {
            // Create or update modal
            let modal = document.getElementById('diagnostics-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'diagnostics-modal';
                modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm';
                modal.innerHTML = `
                    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6">
                        <div class="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 class="text-xl font-bold text-gray-800 dark:text-white">System Diagnostics</h2>
                            <button onclick="document.getElementById('diagnostics-modal').remove()" class="text-gray-500 hover:text-red-500">✕</button>
                        </div>
                        <div id="diag-content" class="flex-1 overflow-y-auto font-mono text-sm space-y-2 p-2 bg-gray-50 dark:bg-slate-900 rounded"></div>
                        <div class="mt-4 flex justify-end gap-2">
                            <button onclick="location.reload()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Reload App</button>
                            <button onclick="localStorage.clear(); location.reload()" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Hard Reset</button>
                            <button onclick="document.getElementById('diagnostics-modal').remove()" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            const content = modal.querySelector('#diag-content');
            let html = '';

            if (report.errors.length === 0 && report.warnings.length === 0) {
                html += `<div class="text-green-500 font-bold">✅ All Systems Nominal</div>`;
            }

            report.errors.forEach(e => html += `<div class="text-red-500">❌ ${e}</div>`);
            report.warnings.forEach(w => html += `<div class="text-yellow-500">⚠️ ${w}</div>`);
            report.info.forEach(i => html += `<div class="text-blue-400">ℹ️ ${i}</div>`);

            content.innerHTML = html;
        }
    };

    window.Diagnostics = Diagnostics;
    Diagnostics.init();
})();

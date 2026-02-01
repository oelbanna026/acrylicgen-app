export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
        <p className="text-slate-400">Configure global application settings.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* General Settings */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-xl font-bold text-white">General</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">Site Name</label>
                        <input type="text" defaultValue="AcrylicGen" className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">Support Email</label>
                        <input type="email" defaultValue="support@acrylicgen.com" className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="maintenance" className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600" />
                    <label htmlFor="maintenance" className="text-sm text-slate-300">Enable Maintenance Mode</label>
                </div>
            </div>
        </div>

        {/* Export Limits */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-xl font-bold text-white">Export Limits</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Free Plan (Daily)</label>
                    <input type="number" defaultValue="3" className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Pro Plan (Daily)</label>
                    <input type="number" defaultValue="100" className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Max File Size (MB)</label>
                    <input type="number" defaultValue="10" className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
            </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-xl font-bold text-white">Pricing Configuration</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Pro Plan Price ($)</label>
                    <input type="number" defaultValue="12" className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Business Plan Price ($)</label>
                    <input type="number" defaultValue="39" className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" />
                </div>
            </div>
        </div>

        <div className="flex justify-end">
            <button className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
}

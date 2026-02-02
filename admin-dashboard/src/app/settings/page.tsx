"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchAPI("/admin/settings", token).then((data) => {
        if (data) setSettings(data);
        setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
        await fetch("/api/admin/settings", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(settings)
        });
        alert("Settings saved successfully!");
    } catch (e) {
        alert("Failed to save settings");
    } finally {
        setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

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
                        <input 
                            type="text" 
                            value={settings.site_name || "AcrylicGen"}
                            onChange={(e) => handleChange("site_name", e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-400">Support Email</label>
                        <input 
                            type="email" 
                            value={settings.support_email || "support@acrylicgen.com"}
                            onChange={(e) => handleChange("support_email", e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="maintenance" 
                        checked={settings.maintenance === "true"}
                        onChange={(e) => handleChange("maintenance", String(e.target.checked))}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-600" 
                    />
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
                    <input 
                        type="number" 
                        value={settings.limit_free || "3"}
                        onChange={(e) => handleChange("limit_free", e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Pro Plan (Daily)</label>
                    <input 
                        type="number" 
                        value={settings.limit_pro || "100"}
                        onChange={(e) => handleChange("limit_pro", e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Max File Size (MB)</label>
                    <input 
                        type="number" 
                        value={settings.max_file_size || "10"}
                        onChange={(e) => handleChange("max_file_size", e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                    />
                </div>
            </div>
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-xl font-bold text-white">Pricing Configuration</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Pro Plan Price ($)</label>
                    <input 
                        type="number" 
                        value={settings.price_pro || "12"}
                        onChange={(e) => handleChange("price_pro", e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-400">Business Plan Price ($)</label>
                    <input 
                        type="number" 
                        value={settings.price_business || "39"}
                        onChange={(e) => handleChange("price_business", e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none" 
                    />
                </div>
            </div>
        </div>

        <div className="flex justify-end">
            <button 
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>
    </div>
  );
}

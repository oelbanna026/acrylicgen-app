"use client";

import { useState, useEffect } from "react";
import { Download, Upload, RefreshCw, FileJson, FileSpreadsheet, FileCode, ShieldCheck } from "lucide-react";

interface Backup {
  filename: string;
  date: string;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/backups", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (error) {
      console.error("Failed to fetch backups", error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!confirm("Are you sure you want to create a new backup?")) return;
    setProcessing(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Backup created successfully!");
        fetchBackups();
      } else {
        alert("Failed to create backup.");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating backup.");
    } finally {
      setProcessing(false);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm(`DANGER: Are you sure you want to restore ${filename}? Current data will be replaced!`)) return;
    setProcessing(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/backups/restore", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ filename })
      });
      if (res.ok) {
        alert("System restored successfully!");
      } else {
        alert("Failed to restore backup.");
      }
    } catch (error) {
      console.error(error);
      alert("Error restoring backup.");
    } finally {
      setProcessing(false);
    }
  };

  const exportData = async (format: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/backups/export?format=${format}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export-users.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Export failed");
      }
    } catch (error) {
      console.error(error);
      alert("Export error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">System Backups & Recovery</h1>
            <p className="text-slate-400 mt-2">Manage database backups, restore points, and data exports.</p>
        </div>
        <button 
          onClick={createBackup} 
          disabled={processing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          {processing ? <RefreshCw className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          Create New Backup
        </button>
      </div>

      {/* Export Section */}
      <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
        <h2 className="text-xl font-semibold mb-4">Export User Data</h2>
        <div className="flex gap-4">
          <button onClick={() => exportData('json')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
            <FileJson className="w-5 h-5 text-yellow-500" />
            Export JSON
          </button>
          <button onClick={() => exportData('csv')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
            <FileSpreadsheet className="w-5 h-5 text-green-500" />
            Export CSV
          </button>
          <button onClick={() => exportData('xml')} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors">
            <FileCode className="w-5 h-5 text-blue-500" />
            Export XML
          </button>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-semibold">Available Backups</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 uppercase text-xs text-slate-500">
              <tr>
                <th className="px-6 py-3">Filename</th>
                <th className="px-6 py-3">Date Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                 <tr><td colSpan={3} className="px-6 py-4 text-center">Loading backups...</td></tr>
              ) : backups.length === 0 ? (
                 <tr><td colSpan={3} className="px-6 py-4 text-center">No backups found.</td></tr>
              ) : (
                backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-mono text-slate-300">{backup.filename}</td>
                    <td className="px-6 py-4">{new Date(backup.date).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => restoreBackup(backup.filename)}
                        disabled={processing}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1 rounded transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Upload className="w-3 h-3" />
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

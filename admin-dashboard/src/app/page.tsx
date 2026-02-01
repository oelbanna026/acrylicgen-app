"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import RevenueChart from "@/components/RevenueChart";
import { fetchAPI } from "@/lib/api";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
       window.location.href = "/admin/login";
       return;
    }

    async function loadData() {
        try {
            const data = await fetchAPI("/admin/stats", token);
            setStats(data);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading stats...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Overview</h2>
        <p className="text-slate-400">Welcome back, Admin. Real-time system metrics.</p>
      </div>

      {/* Pass real data to stats component if available, or modify component to accept props */}
      {/* For now, we inject the fetched values via props or context */}
      {stats && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-sm text-slate-400">Total Exports</p>
                <p className="text-2xl font-bold text-white">{stats.totalExports}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-500">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <p className="text-sm text-slate-400">Active Now</p>
                <p className="text-2xl font-bold text-blue-500">{stats.activeNow}</p>
            </div>
          </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart />
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 text-lg font-bold text-white">System Health</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <span className="text-slate-400">Database Status</span>
                 <span className="text-green-500 font-bold">Connected</span>
             </div>
             <div className="flex justify-between items-center">
                 <span className="text-slate-400">API Latency</span>
                 <span className="text-white">24ms</span>
             </div>
             <div className="flex justify-between items-center">
                 <span className="text-slate-400">Server Uptime</span>
                 <span className="text-white">99.9%</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/DashboardStats";
import RevenueChart from "@/components/RevenueChart";
import { fetchAPI } from "@/lib/api";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [siteStats, setSiteStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
       window.location.href = "/admin/login";
       return;
    }

    async function loadData() {
        try {
            const [data, siteRes] = await Promise.all([
              fetchAPI("/admin/stats", token),
              fetch("/api/stats/dashboard"),
            ]);
            setStats(data);
            if (siteRes.ok) {
              const siteData = await siteRes.json();
              setSiteStats(siteData);
            }
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

      {/* Pass real data to stats component */}
      <DashboardStats data={stats} />
      
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

      {siteStats && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Site Analytics</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="text-sm text-slate-400">Total Views</div>
              <div className="mt-2 text-2xl font-bold text-white">{siteStats.totalViews || 0}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="text-sm text-slate-400">Active Users</div>
              <div className="mt-2 text-2xl font-bold text-white">{siteStats.activeUsers || 0}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="text-sm text-slate-400">Sales (24h)</div>
              <div className="mt-2 text-2xl font-bold text-white">{siteStats.sales24h || 0}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="text-sm text-slate-400">Conversion Rate</div>
              <div className="mt-2 text-2xl font-bold text-white">{siteStats.conversionRate || 0}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

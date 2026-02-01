"use client";

import { useEffect, useState } from "react";
import { Megaphone, BarChart2, MousePointer } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function AdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchAPI("/admin/ads", token).then((data) => {
        if (data) setAds(data);
        setLoading(false);
    });
  }, []);

  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalRevenue = ads.reduce((sum, ad) => sum + ad.revenue, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0";

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Ad Management</h2>
          <p className="text-slate-400">Control ad placements and view revenue stats.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
                    <Megaphone className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Total Impressions</p>
                    <p className="text-2xl font-bold text-white">{totalImpressions.toLocaleString()}</p>
                </div>
            </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                    <MousePointer className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Click Through Rate</p>
                    <p className="text-2xl font-bold text-white">{ctr}%</p>
                </div>
            </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                    <BarChart2 className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Ad Revenue</p>
                    <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Ad Placements */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Ad Placements</h3>
            <div className="space-y-4">
                {ads.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900 border border-slate-800">
                        <div>
                            <p className="font-bold text-white">{ad.name}</p>
                            <p className="text-xs text-slate-500">{ad.placement} • {ad.type}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-bold text-green-500">${ad.revenue}</p>
                                <p className="text-xs text-slate-500">{ad.clicks} clicks</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${ad.status === 'active' ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                                <span className={`text-sm ${ad.status === 'active' ? 'text-green-500' : 'text-slate-500'}`}>{ad.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}

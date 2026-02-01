"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", revenue: 4000, ads: 2400 },
  { name: "Feb", revenue: 3000, ads: 1398 },
  { name: "Mar", revenue: 2000, ads: 9800 },
  { name: "Apr", revenue: 2780, ads: 3908 },
  { name: "May", revenue: 1890, ads: 4800 },
  { name: "Jun", revenue: 2390, ads: 3800 },
  { name: "Jul", revenue: 3490, ads: 4300 },
];

export default function RevenueChart() {
  return (
    <div className="h-[400px] w-full rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
        <p className="text-sm text-slate-400">Monthly revenue from subscriptions vs ads</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Subscription Revenue"
          />
          <Area
            type="monotone"
            dataKey="ads"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorAds)"
            name="Ad Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

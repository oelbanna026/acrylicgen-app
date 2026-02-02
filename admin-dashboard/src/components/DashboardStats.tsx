import { ArrowUpRight, ArrowDownRight, Users, Folder, Download, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardStats({ data }: { data?: any }) {
  // Use real data if provided, otherwise fallback to 0 (not mock data)
  const displayStats = [
    {
      name: "Total Users",
      value: data?.totalUsers || "0",
      change: "+0%", // To be implemented with historical data
      trend: "neutral",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      name: "Active Now",
      value: data?.activeNow || "0",
      change: "Live",
      trend: "up",
      icon: Folder, // Using Folder icon for now as placeholder for 'Active'
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      name: "Total Exports",
      value: data?.totalExports || "0",
      change: "+0%",
      trend: "neutral",
      icon: Download,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      name: "Total Revenue",
      value: `$${data?.totalRevenue || 0}`,
      change: "+0%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {displayStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={cn("rounded-lg p-3", stat.bg)}>
                <Icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                )}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-400">{stat.name}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { ArrowUpRight, ArrowDownRight, Users, Folder, Download, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    name: "Total Users",
    value: "12,345",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    name: "Active Projects",
    value: "45,231",
    change: "+5.4%",
    trend: "up",
    icon: Folder,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    name: "Total Exports",
    value: "89,432",
    change: "-1.2%",
    trend: "down",
    icon: Download,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    name: "Total Revenue",
    value: "$234,567",
    change: "+18.2%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
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

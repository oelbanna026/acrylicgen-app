import { CheckCircle, XCircle } from "lucide-react";

const plans = [
    { name: "Free", price: "$0", users: "8,500", revenue: "$0", features: ["Basic Shapes", "Watermark", "Ads"] },
    { name: "Pro", price: "$12", users: "3,200", revenue: "$38,400", features: ["Unlimited Exports", "No Ads", "Advanced Shapes"] },
    { name: "Business", price: "$39", users: "645", revenue: "$25,155", features: ["Priority Support", "Bulk Export", "Commercial License"] },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Subscriptions</h2>
        <p className="text-slate-400">Manage pricing plans and subscriber statistics.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => (
            <div key={plan.name} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 relative overflow-hidden">
                <div className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rotate-45 transform ${plan.name === 'Pro' ? 'bg-blue-500/20' : plan.name === 'Business' ? 'bg-orange-500/20' : 'bg-slate-500/20'}`}></div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-white mb-4">{plan.price}<span className="text-sm font-normal text-slate-400">/mo</span></div>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Active Users</span>
                        <span className="text-white font-medium">{plan.users}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Est. Revenue</span>
                        <span className="text-green-500 font-medium">{plan.revenue}</span>
                    </div>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-4">
                    {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center text-xs text-slate-400">
                            <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                            {feature}
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchAPI("/admin/payments", token).then((data) => {
        if (data) setPayments(data);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Payments</h2>
        <p className="text-slate-400">Transaction history and invoice status.</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900 text-xs uppercase text-slate-200">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4 font-mono text-slate-300">#{payment.id}</td>
                <td className="px-6 py-4 font-medium text-white">{payment.user_name || 'Unknown'}</td>
                <td className="px-6 py-4 text-green-400 font-bold">${payment.amount}</td>
                <td className="px-6 py-4">{new Date(payment.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium 
                    ${payment.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                      payment.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs">{payment.payment_method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

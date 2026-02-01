"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, Shield, ShieldAlert, Trash2 } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchAPI("/admin/users", token).then((data) => {
        if (data) setUsers(data);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Users</h2>
          <p className="text-slate-400">Manage user accounts and permissions.</p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add User
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900 text-xs uppercase text-slate-200">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Credits</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700 text-slate-300'}`}>
                    {user.role === 'admin' && <Shield className="h-3 w-3" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium 
                    ${user.plan === 'business' ? 'bg-orange-500/10 text-orange-400' : 
                      user.plan === 'pro' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-6 py-4 text-white">{user.credits}</td>
                <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="rounded p-1 hover:bg-slate-700 text-slate-400 hover:text-white">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {user.status !== 'banned' ? (
                        <button className="rounded p-1 hover:bg-red-900/30 text-red-400 hover:text-red-300" title="Ban User">
                            <ShieldAlert className="h-4 w-4" />
                        </button>
                    ) : (
                        <button className="rounded p-1 hover:bg-red-900/30 text-red-400 hover:text-red-300" title="Delete User">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

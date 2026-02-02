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

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newUser)
        });

        if (res.ok) {
            const createdUser = await res.json();
            setUsers([createdUser, ...users]);
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
        } else {
            alert("Failed to create user");
        }
    } catch (err) {
        console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Users</h2>
          <p className="text-slate-400">Manage user accounts and permissions.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add User
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <h3 className="mb-4 text-xl font-bold text-white">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full rounded bg-slate-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newUser.name}
                            onChange={e => setNewUser({...newUser, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full rounded bg-slate-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full rounded bg-slate-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-slate-400">Role</label>
                        <select 
                            className="w-full rounded bg-slate-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="flex-1 rounded bg-slate-800 py-2 font-medium text-white hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
                        >
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

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

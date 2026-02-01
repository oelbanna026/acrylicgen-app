"use client";

import { useEffect, useState } from "react";
import { FileCode, HardDrive } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchAPI("/admin/exports", token).then((data) => {
        if (data) setProjects(data);
        setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Projects (Exports)</h2>
          <p className="text-slate-400">Monitor storage and file usage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                    <FileCode className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Total Exports</p>
                    <p className="text-2xl font-bold text-white">{projects.length}</p>
                </div>
            </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                    <HardDrive className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-slate-400">Est. Storage Used</p>
                    <p className="text-2xl font-bold text-white">{(projects.length * 0.5).toFixed(1)} MB</p>
                </div>
            </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white">Recent Projects</h3>
        </div>
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900 text-xs uppercase text-slate-200">
            <tr>
              <th className="px-6 py-4">Filename</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Cost (Credits)</th>
              <th className="px-6 py-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-white">{project.filename || 'Untitled'}</td>
                <td className="px-6 py-4">{project.user_name || 'Anonymous'}</td>
                <td className="px-6 py-4">
                    <span className="inline-flex rounded bg-slate-700 px-2 py-1 text-xs font-bold text-white">
                        {project.type}
                    </span>
                </td>
                <td className="px-6 py-4">{project.cost}</td>
                <td className="px-6 py-4">{new Date(project.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

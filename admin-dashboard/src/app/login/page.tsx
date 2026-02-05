"use client";

import { useState } from "react";
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
      if (!apiKey) {
        setError("Firebase not configured");
        return;
      }
      setLoading(true);
      const signInRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      const signInData = await signInRes.json().catch(() => ({}));
      if (!signInRes.ok) {
        const message = signInData?.error?.message;
        if (message === "EMAIL_NOT_FOUND") {
          setError("User not found");
        } else if (message === "INVALID_PASSWORD") {
          setError("Invalid password");
        } else {
          setError(message || "Login failed");
        }
        return;
      }
      const idToken = signInData?.idToken;
      if (!idToken) {
        setError("Login failed");
        return;
      }

      const profileRes = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileRes.ok) {
        const data = await profileRes.json().catch(() => ({}));
        setError(data.error || "Login failed");
        return;
      }

      const user = await profileRes.json();
      if (user.role !== "admin") {
        setError("Access denied. Admin only.");
        return;
      }

      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/admin/";
    } catch (err) {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-blue-500">Admin Login</h1>
        
        {error && (
          <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded bg-slate-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded bg-slate-800 p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full rounded bg-blue-600 py-2 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

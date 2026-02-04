"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage (assuming shared domain or login via admin page)
    const t = localStorage.getItem("token");
    if (!t) {
      router.push('/login');
    }
    setToken(t);
  }, [router]);

  return { token };
}

export async function fetchAPI(endpoint: string, token: string | null) {
  if (!token) return null;
  
  // Use relative path /api to hit the Express server when deployed
  // During dev (if running separate port), this might need proxying or full URL
  const res = await fetch(`/api${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      // Handle unauthorized
      return null;
    }
    throw new Error("API Error");
  }

  return res.json();
}

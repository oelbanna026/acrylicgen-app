'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error) {
      router.push('/dashboard')
      router.refresh()
    } else {
      alert(error.message)
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Login to AcrylicGen</h1>
      
      <button 
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2 bg-white border border-gray-300 p-2 rounded hover:bg-gray-50 transition"
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
        Continue with Google
      </button>

      <div className="flex items-center gap-2 text-gray-400">
        <div className="h-[1px] bg-gray-300 flex-1"></div>
        <span>OR</span>
        <div className="h-[1px] bg-gray-300 flex-1"></div>
      </div>

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-3">
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  )
}

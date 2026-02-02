'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <button 
      onClick={handleSignOut}
      className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full p-2 rounded-md hover:bg-red-50"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Box, LayoutDashboard, CreditCard, Settings } from 'lucide-react'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile for name/email
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl tracking-tight">AcrylicGen</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                <LayoutDashboard className="w-4 h-4" />
                Projects
            </Link>
            <Link href="/dashboard/subscription" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                <CreditCard className="w-4 h-4" />
                Subscription
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                <Settings className="w-4 h-4" />
                Settings
            </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
            <div className="mb-4 px-2">
                <p className="text-sm font-medium text-gray-900 truncate">{profile?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="mt-2 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full w-fit">
                    {profile?.plan === 'free' ? 'Free Plan' : profile?.plan + ' Plan'}
                </div>
            </div>
            <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 justify-between md:hidden">
            <span className="font-bold">AcrylicGen</span>
            {/* Mobile menu trigger would go here */}
        </header>
        <div className="p-8 max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  )
}

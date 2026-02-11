'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, LayoutDashboard, CreditCard, Settings, Menu, X } from 'lucide-react'
import SignOutButton from '@/components/SignOutButton'

export default function MobileSidebar({ user, profile }: { user: any, profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Projects', icon: LayoutDashboard },
    { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between md:hidden sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-xl tracking-tight">AcrylicGen</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-gray-600">
            <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:transform-none md:static md:shadow-none md:flex md:flex-col md:border-r md:border-gray-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Box className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-xl tracking-tight">AcrylicGen</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500">
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                    <Link 
                        key={link.href}
                        href={link.href} 
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Icon className="w-4 h-4" />
                        {link.label}
                    </Link>
                )
            })}
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
    </>
  )
}

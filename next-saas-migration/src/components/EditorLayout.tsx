
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Menu, X, Download } from 'lucide-react'

export default function EditorLayout({ 
  project, 
  children, // Canvas
  sidebar   // AutoSaveEditor
}: { 
  project: any, 
  children: React.ReactNode, 
  sidebar: React.ReactNode 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 flex items-center px-4 md:px-6 justify-between bg-white z-20 flex-shrink-0">
            <div className="flex items-center gap-3 md:gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="font-semibold text-gray-900 text-sm md:text-base truncate max-w-[150px] md:max-w-xs">{project.name}</h1>
                    <p className="text-xs text-gray-500">{project.width} x {project.height} cm</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
                <button className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow">
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>
                <button 
                    className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle settings"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
            
            {/* Canvas Area */}
            <div className="flex-1 h-full relative overflow-hidden bg-gray-100/50">
                {children}
            </div>

            {/* Sidebar (Mobile Drawer / Desktop Sidebar) */}
            <div className={`
                fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-30
                md:relative md:transform-none md:shadow-none md:border-l md:border-gray-200 md:flex md:flex-col md:w-80 md:bg-white
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}
            style={{ top: isSidebarOpen ? '64px' : '0', height: isSidebarOpen ? 'calc(100% - 64px)' : '100%' }}
            >
                <div className="h-full overflow-y-auto p-6">
                    {sidebar}
                </div>
            </div>
            
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-20 md:hidden top-16 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </main>
    </div>
  )
}

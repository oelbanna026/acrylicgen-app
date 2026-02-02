import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AutoSaveEditor from '@/components/AutoSaveEditor'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditorPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!project) redirect('/dashboard')

  return (
    <div className="flex flex-col h-screen">
        <header className="h-16 border-b border-gray-200 flex items-center px-6 justify-between bg-white">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="font-semibold text-gray-900">{project.name}</h1>
                    <p className="text-xs text-gray-500">{project.width} x {project.height} cm</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Export</button>
            </div>
        </header>

        <main className="flex-1 bg-gray-50 p-6 overflow-hidden">
            <div className="h-full flex gap-6">
                {/* Canvas Area */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex items-center justify-center relative">
                    <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(40,minmax(0,1fr))] opacity-5 pointer-events-none">
                        {/* Grid background simulation */}
                    </div>
                    
                    {/* Placeholder for Canvas */}
                    <div className="w-64 h-64 border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-blue-500 font-mono">
                        {project.width}x{project.height}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                     <AutoSaveEditor projectId={project.id} initialData={project.design_json} />
                </div>
            </div>
        </main>
    </div>
  )
}

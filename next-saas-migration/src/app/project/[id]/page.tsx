
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AutoSaveEditor from '@/components/AutoSaveEditor'
import EditorLayout from '@/components/EditorLayout'

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
    <EditorLayout 
        project={project}
        sidebar={<AutoSaveEditor projectId={project.id} initialData={project.design_json} />}
    >
        {/* Canvas Area */}
        <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center relative overflow-hidden m-4 md:m-0 max-h-[calc(100vh-8rem)] md:max-h-full">
            <div className="absolute inset-0 grid grid-cols-[repeat(40,minmax(0,1fr))] grid-rows-[repeat(40,minmax(0,1fr))] opacity-5 pointer-events-none">
                {/* Grid background simulation */}
            </div>
            
            {/* Placeholder for Canvas */}
            <div className="w-64 h-64 border-2 border-blue-500 bg-blue-50 flex items-center justify-center text-blue-500 font-mono shadow-lg rounded-lg">
                {project.width}x{project.height}
            </div>
        </div>
    </EditorLayout>
  )
}

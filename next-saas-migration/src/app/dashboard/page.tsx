import { getProjects, createProject } from '@/actions/projects'
import { Plus, FileBox, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-500">Manage and edit your acrylic designs.</p>
        </div>
        
        <form action={createProject}>
            <input type="hidden" name="name" value="New Untitled Project" />
            <input type="hidden" name="width" value="20" />
            <input type="hidden" name="height" value="20" />
            <button 
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
                <Plus className="w-4 h-4" />
                New Project
            </button>
        </form>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileBox className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Create your first acrylic box design to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
                <Link 
                    href={`/project/${project.id}`} 
                    key={project.id}
                    className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <FileBox className="w-6 h-6 text-blue-600" />
                        </div>
                        {/* <span className="text-xs text-gray-400 font-mono">ID: {project.id.slice(0,4)}</span> */}
                    </div>
                    
                    <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>{project.width}x{project.height} cm</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-4">
                        <Calendar className="w-3 h-3" />
                        <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                </Link>
            ))}
        </div>
      )}
    </div>
  )
}

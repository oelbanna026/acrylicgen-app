'use client'

import { useCallback, useEffect, useState } from 'react'
import { updateProject } from '@/actions/projects'

export default function AutoSaveEditor({ projectId, initialData }: { projectId: string, initialData: any }) {
  const [data, setData] = useState(initialData)
  const [status, setStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  // Auto Save Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (status === 'unsaved') {
        setStatus('saving')
        try {
          await updateProject(projectId, data)
          setStatus('saved')
        } catch (e) {
          console.error('Save failed', e)
          setStatus('unsaved') // Retry?
        }
      }
    }, 5000) // 5 seconds debounce

    return () => clearTimeout(timer)
  }, [data, status, projectId])

  const handleChange = (newData: any) => {
    setData(newData)
    setStatus('unsaved')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Project Editor</h2>
        <span className={`text-sm ${status === 'saved' ? 'text-green-500' : 'text-amber-500'}`}>
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'All changes saved' : 'Unsaved changes'}
        </span>
      </div>
      
      {/* Example Canvas / Inputs */}
      <textarea 
        className="w-full h-64 p-4 border rounded font-mono"
        value={JSON.stringify(data, null, 2)}
        onChange={(e) => {
            try {
                handleChange(JSON.parse(e.target.value))
            } catch (e) {
                // Invalid JSON, ignore or show error
            }
        }}
      />
    </div>
  )
}

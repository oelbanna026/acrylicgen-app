import DxfJointEditor from '@/components/dxf/DxfJointEditor'

export default function PublicDxfJointsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">DXF Joints</h1>
          <p className="text-sm text-gray-600 mt-1">
            ارفع ملف DXF، سيحاول النظام اكتشاف التعشيقات تلقائياً، ثم يمكنك تغيير المقاس عالميًا وتصدير DXF/SVG.
          </p>
        </div>
        <DxfJointEditor />
      </div>
    </div>
  )
}


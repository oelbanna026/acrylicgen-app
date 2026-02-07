import { ImportPanel } from './components/ImportPanel';
import { EditorCanvas } from './components/EditorCanvas';

function App() {
  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-gray-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Acrylic Studio Pro</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r flex flex-col">
          <ImportPanel />
          <div className="p-4">
            <h3 className="font-bold text-gray-500 mb-2">Layers</h3>
            {/* Layer List Component would go here */}
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 relative">
          <EditorCanvas />
        </main>
      </div>
    </div>
  );
}

export default App;

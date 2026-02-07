import React, { useRef } from 'react';
import { useStore, Shape } from '../store';
import { parse as parseSvg } from 'svg-parser';
import DxfParser from 'dxf-parser';
import { v4 as uuidv4 } from 'uuid';

export const ImportPanel: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importShapes = useStore((state) => state.importShapes);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'svg') {
      processSvg(text);
    } else if (ext === 'dxf') {
      processDxf(text);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processSvg = (content: string) => {
    const parsed = parseSvg(content);
    // Simplified SVG Walker
    const shapes: Shape[] = [];
    
    const walk = (node: any) => {
      if (node.tagName === 'path') {
        shapes.push({
          id: uuidv4(),
          type: 'path',
          x: 0, 
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          pathData: node.properties.d,
          stroke: node.properties.stroke || '#000',
          fill: node.properties.fill || 'none'
        });
      }
      if (node.children) node.children.forEach(walk);
    };
    
    walk(parsed.children[0]);
    importShapes(shapes);
  };

  const processDxf = (content: string) => {
    const parser = new DxfParser();
    try {
      const dxf = parser.parseSync(content);
      const shapes: Shape[] = [];
      
      dxf?.entities.forEach((entity: any) => {
        // Very basic DXF mapping for POC
        if (entity.type === 'LWPOLYLINE') {
           // Convert vertices to SVG Path data
           const pts = entity.vertices.map((v: any) => `${v.x},${v.y}`).join(' L ');
           shapes.push({
             id: uuidv4(),
             type: 'path',
             x: 0,
             y: 0,
             scaleX: 1,
             scaleY: 1,
             rotation: 0,
             pathData: `M ${pts} ${entity.closed ? 'Z' : ''}`,
             stroke: '#000'
           });
        }
      });
      
      importShapes(shapes);
    } catch(err) {
      console.error(err);
      alert('DXF Parse Error');
    }
  };

  return (
    <div className="p-4 bg-white border-b flex gap-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".svg,.dxf"
        onChange={handleFile}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Import DXF/SVG
      </button>
    </div>
  );
};

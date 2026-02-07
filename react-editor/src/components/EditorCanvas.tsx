import React, { useState } from 'react';
import { Stage, Layer, Path, Rect, Transformer } from 'react-konva';
import { useStore } from '../store';

export const EditorCanvas: React.FC = () => {
  const shapes = useStore((state) => state.shapes);
  const selectedIds = useStore((state) => state.selectedIds);
  const selectShape = useStore((state) => state.selectShape);
  const updateShape = useStore((state) => state.updateShape);
  
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <Stage 
        width={window.innerWidth} 
        height={window.innerHeight}
        draggable
        onWheel={(e) => {
          e.evt.preventDefault();
          const scaleBy = 1.1;
          const oldScale = scale;
          const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
          setScale(newScale);
        }}
      >
        <Layer>
          {/* Sheet Background */}
          <Rect 
            x={0} y={0} 
            width={2440} height={1220} 
            fill="white" 
            stroke="#ddd" 
            strokeWidth={2}
          />
          
          {shapes.map((shape) => {
            if (shape.type === 'path') {
              return (
                <Path
                  key={shape.id}
                  data={shape.pathData}
                  x={shape.x}
                  y={shape.y}
                  scaleX={shape.scaleX}
                  scaleY={shape.scaleY}
                  rotation={shape.rotation}
                  stroke={shape.stroke}
                  fill={shape.fill}
                  draggable
                  onClick={() => selectShape(shape.id)}
                  onDragEnd={(e) => {
                    updateShape(shape.id, {
                      x: e.target.x(),
                      y: e.target.y()
                    });
                  }}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

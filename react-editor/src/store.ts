import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Shape {
  id: string;
  type: 'path' | 'rect' | 'circle' | 'group';
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  pathData?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  children?: Shape[];
  locked?: boolean;
}

interface EditorState {
  shapes: Shape[];
  selectedIds: string[];
  canvasConfig: {
    width: number;
    height: number;
    gridSize: number;
    zoom: number;
  };
  addShape: (shape: Partial<Shape>) => void;
  updateShape: (id: string, attrs: Partial<Shape>) => void;
  selectShape: (id: string | null, multi?: boolean) => void;
  removeSelected: () => void;
  importShapes: (newShapes: Shape[]) => void;
}

export const useStore = create<EditorState>((set) => ({
  shapes: [],
  selectedIds: [],
  canvasConfig: {
    width: 2440, // mm
    height: 1220, // mm
    gridSize: 10,
    zoom: 1,
  },
  
  addShape: (shape) => set((state) => ({
    shapes: [...state.shapes, {
      id: uuidv4(),
      type: 'rect',
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      stroke: '#000000',
      strokeWidth: 1,
      ...shape
    } as Shape]
  })),

  updateShape: (id, attrs) => set((state) => ({
    shapes: state.shapes.map(s => s.id === id ? { ...s, ...attrs } : s)
  })),

  selectShape: (id, multi = false) => set((state) => {
    if (id === null) return { selectedIds: [] };
    if (multi) {
      return { 
        selectedIds: state.selectedIds.includes(id) 
          ? state.selectedIds.filter(sid => sid !== id)
          : [...state.selectedIds, id]
      };
    }
    return { selectedIds: [id] };
  }),

  removeSelected: () => set((state) => ({
    shapes: state.shapes.filter(s => !state.selectedIds.includes(s.id)),
    selectedIds: []
  })),

  importShapes: (newShapes) => set((state) => ({
    shapes: [...state.shapes, ...newShapes]
  })),
}));

import { create } from 'zustand';

type View = 'landing' | 'chat' | 'image-gen' | 'image-tools' | 'tool';

interface AppState {
  currentView: View;
  selectedToolId: string | null;
  setCurrentView: (view: View) => void;
  setSelectedToolId: (toolId: string | null) => void;
  openTool: (toolId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'landing',
  selectedToolId: null,
  setCurrentView: (view) => set({ currentView: view }),
  setSelectedToolId: (toolId) => set({ selectedToolId: toolId }),
  openTool: (toolId) => set({ currentView: 'tool', selectedToolId: toolId }),
}));

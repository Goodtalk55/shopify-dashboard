import { create } from 'zustand';

interface Log {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: string;
}

interface ProcessState {
  isProcessing: boolean;
  progress: number;
  total: number;
  current: number;
  logs: Log[];
  speed: number;
  csvData: any[]; // Store the actual data to process
  selectedStore: any; // Store info for real API calls
  startProcess: (data: any[], store: any) => void;
  pauseProcess: () => void;
  stopProcess: () => void;
  addLog: (message: string, type: Log['type']) => void;
  updateProgress: (current: number) => void;
  setSpeed: (speed: number) => void;
}

export const useProcessStore = create<ProcessState>((set, get) => ({
  isProcessing: false,
  progress: 0,
  total: 0,
  current: 0,
  logs: [],
  speed: 1000,
  csvData: [],
  selectedStore: null,
  
  startProcess: (data, store) => set({ 
    isProcessing: true, 
    total: data.length, 
    current: 0, 
    progress: 0,
    csvData: data,
    selectedStore: store,
    logs: [{
      id: Math.random().toString(36).substr(2, 9),
      message: `Starting real automation for ${data.length} orders on ${store.domain}...`,
      type: 'info',
      timestamp: new Date().toLocaleTimeString()
    }]
  }),
  
  pauseProcess: () => set({ isProcessing: false }),
  
  stopProcess: () => set({ 
    isProcessing: false, 
    current: 0, 
    progress: 0,
    csvData: [],
    logs: [...get().logs, {
      id: Math.random().toString(36).substr(2, 9),
      message: "Process stopped.",
      type: 'warning',
      timestamp: new Date().toLocaleTimeString()
    }]
  }),
  
  addLog: (message, type) => set((state) => ({
    logs: [
      {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type,
        timestamp: new Date().toLocaleTimeString()
      },
      ...state.logs
    ].slice(0, 100)
  })),
  
  updateProgress: (current) => set((state) => ({
    current,
    progress: state.total > 0 ? Math.round((current / state.total) * 100) : 0
  })),

  setSpeed: (speed) => set({ speed })
}));

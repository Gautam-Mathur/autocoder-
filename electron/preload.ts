const { contextBridge, ipcRenderer } = require('electron');
import type { IpcRendererEvent } from 'electron';

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

export interface ElectronAPI {
  // File & Project operations
  writeFiles: (projectName: string, files: Array<{ path: string; content: string }>) => Promise<{ success: boolean; projectPath?: string; error?: string }>;
  npmInstall: (projectName: string) => Promise<{ success: boolean; error?: string }>;
  startServer: (projectName: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  stopServer: () => Promise<{ success: boolean; error?: string }>;
  getStatus: () => Promise<{ isRunning: boolean; url: string | null }>;
  listProjects: () => Promise<string[]>;
  deleteProject: (projectName: string) => Promise<{ success: boolean; error?: string }>;
  openProject: (projectName: string) => Promise<{ success: boolean; error?: string }>;
  isElectron: () => Promise<boolean>;
  
  // Event listeners
  onLog: (callback: (log: string) => void) => () => void;
  onProgress: (callback: (data: { percent: number; message: string }) => void) => () => void;
  onServerReady: (callback: (url: string) => void) => () => void;
  onLogEntry: (callback: (entry: LogEntry) => void) => () => void;
  
  // Logger API
  getLogs: (count?: number) => Promise<LogEntry[]>;
  getLogFile: () => Promise<string>;
  setLogLevel: (level: 'debug' | 'info' | 'warn' | 'error') => Promise<{ success: boolean }>;
}

const electronAPI: ElectronAPI = {
  writeFiles: (projectName, files) => 
    ipcRenderer.invoke('runner:writeFiles', projectName, files),
  
  npmInstall: (projectName) => 
    ipcRenderer.invoke('runner:npmInstall', projectName),
  
  startServer: (projectName) => 
    ipcRenderer.invoke('runner:startServer', projectName),
  
  stopServer: () => 
    ipcRenderer.invoke('runner:stopServer'),
  
  getStatus: () => 
    ipcRenderer.invoke('runner:getStatus'),
  
  listProjects: () => 
    ipcRenderer.invoke('project:list'),
  
  deleteProject: (projectName) => 
    ipcRenderer.invoke('project:delete', projectName),
  
  openProject: (projectName) => 
    ipcRenderer.invoke('project:open', projectName),
  
  isElectron: () => 
    ipcRenderer.invoke('isElectron'),
  
  onLog: (callback) => {
    const handler = (_event: IpcRendererEvent, log: string) => callback(log);
    ipcRenderer.on('runner:log', handler);
    return () => ipcRenderer.removeListener('runner:log', handler);
  },

  onProgress: (callback) => {
    const handler = (_event: IpcRendererEvent, data: { percent: number; message: string }) => callback(data);
    ipcRenderer.on('runner:progress', handler);
    return () => ipcRenderer.removeListener('runner:progress', handler);
  },
  
  onServerReady: (callback) => {
    const handler = (_event: IpcRendererEvent, url: string) => callback(url);
    ipcRenderer.on('runner:serverReady', handler);
    return () => ipcRenderer.removeListener('runner:serverReady', handler);
  },

  onLogEntry: (callback) => {
    const handler = (_event: IpcRendererEvent, entry: LogEntry) => callback(entry);
    ipcRenderer.on('logger:entry', handler);
    return () => ipcRenderer.removeListener('logger:entry', handler);
  },

  // Logger API
  getLogs: (count) => 
    ipcRenderer.invoke('logger:getLogs', count),
  
  getLogFile: () => 
    ipcRenderer.invoke('logger:getLogFile'),
  
  setLogLevel: (level) => 
    ipcRenderer.invoke('logger:setLevel', level),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

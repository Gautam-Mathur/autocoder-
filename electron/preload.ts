/// <reference types="node" />
const { contextBridge, ipcRenderer } = require('electron');

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

interface ElectronAPI {
  writeFiles: (projectName: string, files: Array<{ path: string; content: string }>) => Promise<{ success: boolean; projectPath?: string; error?: string }>;
  npmInstall: (projectName: string) => Promise<{ success: boolean; error?: string }>;
  startServer: (projectName: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  stopServer: () => Promise<{ success: boolean; error?: string }>;
  getStatus: () => Promise<{ isRunning: boolean; url: string | null }>;
  listProjects: () => Promise<string[]>;
  deleteProject: (projectName: string) => Promise<{ success: boolean; error?: string }>;
  openProject: (projectName: string) => Promise<{ success: boolean; error?: string }>;
  isElectron: () => Promise<boolean>;
  onLog: (callback: (log: string) => void) => () => void;
  onProgress: (callback: (data: { percent: number; message: string }) => void) => () => void;
  onServerReady: (callback: (url: string) => void) => () => void;
  onLogEntry: (callback: (entry: LogEntry) => void) => () => void;
  getLogs: (count?: number) => Promise<LogEntry[]>;
  getLogFile: () => Promise<string>;
  setLogLevel: (level: 'debug' | 'info' | 'warn' | 'error') => Promise<{ success: boolean }>;
}

const electronAPI: ElectronAPI = {
  writeFiles: (projectName: string, files: Array<{ path: string; content: string }>) => 
    ipcRenderer.invoke('runner:writeFiles', projectName, files),
  
  npmInstall: (projectName: string) => 
    ipcRenderer.invoke('runner:npmInstall', projectName),
  
  startServer: (projectName: string) => 
    ipcRenderer.invoke('runner:startServer', projectName),
  
  stopServer: () => 
    ipcRenderer.invoke('runner:stopServer'),
  
  getStatus: () => 
    ipcRenderer.invoke('runner:getStatus'),
  
  listProjects: () => 
    ipcRenderer.invoke('project:list'),
  
  deleteProject: (projectName: string) => 
    ipcRenderer.invoke('project:delete', projectName),
  
  openProject: (projectName: string) => 
    ipcRenderer.invoke('project:open', projectName),
  
  isElectron: () => 
    ipcRenderer.invoke('isElectron'),
  
  onLog: (callback: (log: string) => void) => {
    const handler = (_event: any, log: string) => callback(log);
    ipcRenderer.on('runner:log', handler);
    return () => ipcRenderer.removeListener('runner:log', handler);
  },

  onProgress: (callback: (data: { percent: number; message: string }) => void) => {
    const handler = (_event: any, data: { percent: number; message: string }) => callback(data);
    ipcRenderer.on('runner:progress', handler);
    return () => ipcRenderer.removeListener('runner:progress', handler);
  },
  
  onServerReady: (callback: (url: string) => void) => {
    const handler = (_event: any, url: string) => callback(url);
    ipcRenderer.on('runner:serverReady', handler);
    return () => ipcRenderer.removeListener('runner:serverReady', handler);
  },

  onLogEntry: (callback: (entry: LogEntry) => void) => {
    const handler = (_event: any, entry: LogEntry) => callback(entry);
    ipcRenderer.on('logger:entry', handler);
    return () => ipcRenderer.removeListener('logger:entry', handler);
  },

  getLogs: (count?: number) => 
    ipcRenderer.invoke('logger:getLogs', count),
  
  getLogFile: () => 
    ipcRenderer.invoke('logger:getLogFile'),
  
  setLogLevel: (level: 'debug' | 'info' | 'warn' | 'error') => 
    ipcRenderer.invoke('logger:setLevel', level),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export {};

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export interface ElectronAPI {
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
  onServerReady: (callback: (url: string) => void) => () => void;
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
  
  onServerReady: (callback) => {
    const handler = (_event: IpcRendererEvent, url: string) => callback(url);
    ipcRenderer.on('runner:serverReady', handler);
    return () => ipcRenderer.removeListener('runner:serverReady', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

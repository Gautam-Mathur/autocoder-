export interface ProjectFile {
  path: string;
  content: string;
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
  onServerReady: (callback: (url: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export type LogCallback = (log: string) => void;

export interface RunResult {
  success: boolean;
  error?: string;
}

export interface ServerResult {
  success: boolean;
  url?: string;
  error?: string;
}

let currentProjectName: string | null = null;
let logUnsubscribe: (() => void) | null = null;
let serverUnsubscribe: (() => void) | null = null;

export function isElectronEnvironment(): boolean {
  return typeof window !== 'undefined' && 'electronAPI' in window && window.electronAPI !== undefined;
}

function getElectronAPI(): ElectronAPI {
  if (!window.electronAPI) {
    throw new Error('Electron API not available');
  }
  return window.electronAPI;
}

export async function writeFiles(projectName: string, files: ProjectFile[], onLog?: LogCallback): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }

  const api = getElectronAPI();
  currentProjectName = projectName;
  onLog?.(`[AutoCoder] Writing ${files.length} files to ${projectName}...`);

  const result = await api.writeFiles(projectName, files);
  
  if (result.success) {
    onLog?.(`[AutoCoder] Files written to ${result.projectPath}`);
  } else {
    onLog?.(`[AutoCoder] Error: ${result.error}`);
  }

  return result;
}

export async function installDependencies(projectName: string, onLog?: LogCallback): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }

  const api = getElectronAPI();
  if (logUnsubscribe) {
    logUnsubscribe();
  }
  logUnsubscribe = api.onLog((log) => {
    onLog?.(log);
  });

  const result = await api.npmInstall(projectName);
  
  return result;
}

export async function startDevServer(projectName: string, onLog?: LogCallback): Promise<ServerResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }

  const api = getElectronAPI();
  if (serverUnsubscribe) {
    serverUnsubscribe();
  }
  serverUnsubscribe = api.onServerReady((url) => {
    onLog?.(`[AutoCoder] Server ready at ${url}`);
  });

  if (logUnsubscribe) {
    logUnsubscribe();
  }
  logUnsubscribe = api.onLog((log) => {
    onLog?.(log);
  });

  const result = await api.startServer(projectName);
  
  return result;
}

export async function stopDevServer(): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }

  const api = getElectronAPI();
  const result = await api.stopServer();
  
  if (logUnsubscribe) {
    logUnsubscribe();
    logUnsubscribe = null;
  }
  if (serverUnsubscribe) {
    serverUnsubscribe();
    serverUnsubscribe = null;
  }

  return result;
}

export async function getServerStatus(): Promise<{ isRunning: boolean; url: string | null }> {
  if (!isElectronEnvironment()) {
    return { isRunning: false, url: null };
  }

  return getElectronAPI().getStatus();
}

export async function listProjects(): Promise<string[]> {
  if (!isElectronEnvironment()) {
    return [];
  }

  return getElectronAPI().listProjects();
}

export async function deleteProject(projectName: string): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }

  return getElectronAPI().deleteProject(projectName);
}

export async function openProjectFolder(projectName: string): Promise<RunResult> {
  if (!isElectronEnvironment()) {
    return { success: false, error: 'Not running in Electron' };
  }

  return getElectronAPI().openProject(projectName);
}

export function getCurrentProjectName(): string | null {
  return currentProjectName;
}

export function cleanup(): void {
  if (logUnsubscribe) {
    logUnsubscribe();
    logUnsubscribe = null;
  }
  if (serverUnsubscribe) {
    serverUnsubscribe();
    serverUnsubscribe = null;
  }
}

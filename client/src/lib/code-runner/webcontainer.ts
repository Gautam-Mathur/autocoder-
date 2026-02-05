import { WebContainer, FileSystemTree } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export interface RunResult {
  success: boolean;
  output: string[];
  errors: string[];
  exitCode: number;
}

export type { FileSystemTree };

export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }
  
  if (bootPromise) {
    return bootPromise;
  }
  
  bootPromise = WebContainer.boot();
  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
}

export async function mountFiles(files: FileSystemTree): Promise<void> {
  const container = await getWebContainer();
  await container.mount(files);
}

export async function writeFile(path: string, contents: string): Promise<void> {
  const container = await getWebContainer();
  await container.fs.writeFile(path, contents);
}

export async function readFile(path: string): Promise<string> {
  const container = await getWebContainer();
  return await container.fs.readFile(path, 'utf-8');
}

export async function runCommand(
  command: string,
  args: string[] = [],
  onOutput?: (data: string) => void
): Promise<RunResult> {
  const container = await getWebContainer();
  const output: string[] = [];
  const errors: string[] = [];
  
  const process = await container.spawn(command, args);
  
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        output.push(data);
        onOutput?.(data);
      },
    })
  );
  
  const exitCode = await process.exit;
  
  return {
    success: exitCode === 0,
    output,
    errors,
    exitCode,
  };
}

export async function installDependencies(
  onOutput?: (data: string) => void,
  timeoutMs: number = 60000
): Promise<RunResult> {
  const container = await getWebContainer();
  const output: string[] = [];
  const errors: string[] = [];
  
  return new Promise(async (resolve) => {
    const timeoutId = setTimeout(() => {
      onOutput?.('\n⚠️ npm install timed out after 60s - proceeding anyway...\n');
      resolve({
        success: true,
        output: [...output, 'Installation timed out - some packages may be missing'],
        errors: ['Timeout after 60 seconds'],
        exitCode: 0,
      });
    }, timeoutMs);
    
    try {
      const process = await container.spawn('npm', ['install', '--prefer-offline', '--no-audit', '--progress=false']);
      
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output.push(data);
            onOutput?.(data);
          },
        })
      );
      
      const exitCode = await process.exit;
      clearTimeout(timeoutId);
      
      resolve({
        success: exitCode === 0,
        output,
        errors,
        exitCode,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      resolve({
        success: false,
        output,
        errors: [String(err)],
        exitCode: 1,
      });
    }
  });
}

export async function runNodeScript(
  scriptPath: string,
  onOutput?: (data: string) => void
): Promise<RunResult> {
  return runCommand('node', [scriptPath], onOutput);
}

export async function startDevServer(
  onOutput?: (data: string) => void,
  onServerReady?: (url: string) => void
): Promise<{ url: string; process: any }> {
  const container = await getWebContainer();
  
  const process = await container.spawn('npm', ['run', 'dev']);
  
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        onOutput?.(data);
      },
    })
  );
  
  return new Promise((resolve) => {
    container.on('server-ready', (port, url) => {
      onServerReady?.(url);
      resolve({ url, process });
    });
  });
}

export function isWebContainerSupported(): boolean {
  return typeof SharedArrayBuffer !== 'undefined';
}

export async function teardown(): Promise<void> {
  if (webcontainerInstance) {
    await webcontainerInstance.teardown();
    webcontainerInstance = null;
    bootPromise = null;
  }
}

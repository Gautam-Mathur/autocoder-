import { WebContainer, FileSystemTree } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let lastPackageJsonHash: string | null = null;
let preWarmPromise: Promise<boolean> | null = null;
let preWarmStatus: 'idle' | 'booting' | 'installing' | 'ready' | 'failed' = 'idle';
let preWarmListeners: Array<(status: string, message: string) => void> = [];

const CORE_PACKAGES: Record<string, string> = {
  'react': '^18.3.1',
  'react-dom': '^18.3.1',
  'wouter': '^3.0.0',
  '@tanstack/react-query': '^5.0.0',
  'lucide-react': '^0.344.0',
  'recharts': '^2.12.0',
  'date-fns': '^3.3.1',
  'clsx': '^2.1.0',
  'tailwind-merge': '^2.2.0',
  'zod': '^3.22.0',
};

const CORE_DEV_PACKAGES: Record<string, string> = {
  'vite': '^5.1.0',
  '@vitejs/plugin-react': '^4.2.0',
  'tailwindcss': '^3.4.1',
  'postcss': '^8.4.35',
  'autoprefixer': '^10.4.17',
};

export interface RunResult {
  success: boolean;
  output: string[];
  errors: string[];
  exitCode: number;
}

export type { FileSystemTree };

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export async function hasNodeModules(): Promise<boolean> {
  try {
    const container = await getWebContainer();
    await container.fs.readdir('node_modules');
    return true;
  } catch {
    return false;
  }
}

export function setPackageJsonHash(packageJson: string): boolean {
  const newHash = simpleHash(packageJson);
  const changed = lastPackageJsonHash !== newHash;
  lastPackageJsonHash = newHash;
  return changed;
}

export function getPreWarmStatus(): string {
  return preWarmStatus;
}

export function onPreWarmProgress(listener: (status: string, message: string) => void) {
  preWarmListeners.push(listener);
  return () => {
    preWarmListeners = preWarmListeners.filter(l => l !== listener);
  };
}

function notifyPreWarm(status: string, message: string) {
  preWarmListeners.forEach(l => l(status, message));
}

export function getPreWarmedPackages(): { deps: Record<string, string>; devDeps: Record<string, string> } {
  return { deps: { ...CORE_PACKAGES }, devDeps: { ...CORE_DEV_PACKAGES } };
}

export async function preWarmWebContainer(): Promise<boolean> {
  if (preWarmStatus === 'ready') return true;
  if (preWarmPromise && preWarmStatus !== 'failed') return preWarmPromise;

  preWarmPromise = (async () => {
    try {
      preWarmStatus = 'booting';
      notifyPreWarm('booting', 'Starting environment...');

      const container = await getWebContainer();
      notifyPreWarm('booting', 'Environment ready');

      preWarmStatus = 'installing';
      notifyPreWarm('installing', 'Pre-installing core packages...');

      const allDeps = { ...CORE_PACKAGES };
      const allDevDeps = { ...CORE_DEV_PACKAGES };

      const minimalPkg = JSON.stringify({
        name: 'prewarm-cache',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: { dev: 'vite' },
        dependencies: allDeps,
        devDependencies: allDevDeps,
      }, null, 2);

      await container.fs.writeFile('package.json', minimalPkg);

      const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`;
      await container.fs.writeFile('vite.config.ts', viteConfig);

      const installProcess = await container.spawn('npm', [
        'install',
        '--prefer-offline',
        '--no-audit',
        '--no-fund',
        '--loglevel=error',
        '--fetch-retries=2',
        '--fetch-timeout=30000'
      ]);

      let installOutput = '';
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            installOutput += data;
            if (data.includes('added')) {
              notifyPreWarm('installing', data.trim());
            }
          },
        })
      );

      const exitCode = await installProcess.exit;

      if (exitCode === 0) {
        preWarmStatus = 'ready';
        notifyPreWarm('ready', 'Core packages pre-installed');
        return true;
      } else {
        preWarmStatus = 'failed';
        preWarmPromise = null;
        notifyPreWarm('failed', 'Pre-install failed, will install on demand');
        return false;
      }
    } catch (err) {
      preWarmStatus = 'failed';
      preWarmPromise = null;
      notifyPreWarm('failed', `Pre-warm error: ${err}`);
      return false;
    }
  })();

  return preWarmPromise;
}

export async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }
  
  if (bootPromise) {
    return bootPromise;
  }
  
  bootPromise = WebContainer.boot({ coep: 'credentialless' });
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
  timeoutMs: number = 180000,
  maxRetries: number = 3
): Promise<RunResult> {
  const container = await getWebContainer();
  const allOutput: string[] = [];
  const allErrors: string[] = [];
  
  // Retry with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const output: string[] = [];
    const errors: string[] = [];
    let timedOut = false;
    
    onOutput?.(`\n📦 npm install attempt ${attempt}/${maxRetries}...\n`);
    
    const result = await new Promise<RunResult>(async (resolve) => {
      const timeoutId = setTimeout(() => {
        timedOut = true;
        onOutput?.(`\n⚠️ Attempt ${attempt} timed out after ${Math.round(timeoutMs/1000)}s\n`);
        resolve({
          success: false,
          output: [...output],
          errors: ['Timeout'],
          exitCode: -1,
        });
      }, timeoutMs);
      
      try {
        // Use more aggressive npm flags to reduce network calls
        const process = await container.spawn('npm', [
          'install',
          '--prefer-offline',     // Use cache first
          '--no-audit',           // Skip security audit
          '--no-fund',            // Skip funding messages
          '--loglevel=error',     // Reduce output noise
          '--fetch-retries=2',    // Retry network failures
          '--fetch-timeout=30000' // 30s timeout per request
        ]);
        
        process.output.pipeTo(
          new WritableStream({
            write(data) {
              output.push(data);
              allOutput.push(data);
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
        const errStr = String(err);
        errors.push(errStr);
        allErrors.push(errStr);
        resolve({
          success: false,
          output,
          errors: [errStr],
          exitCode: 1,
        });
      }
    });
    
    if (result.success) {
      onOutput?.('\n✅ Dependencies installed successfully!\n');
      return {
        success: true,
        output: allOutput,
        errors: allErrors,
        exitCode: 0,
      };
    }
    
    // If this wasn't the last attempt, wait before retrying
    if (attempt < maxRetries) {
      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      onOutput?.(`\n🔄 Retrying in ${backoffMs/1000}s...\n`);
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  
  // All retries failed - try minimal install
  onOutput?.('\n⚠️ Standard install failed, trying minimal install...\n');
  
  try {
    const minimalResult = await new Promise<RunResult>(async (resolve) => {
      const timeoutId = setTimeout(() => {
        resolve({
          success: false,
          output: [],
          errors: ['Minimal install timed out'],
          exitCode: -1,
        });
      }, 60000); // 60s timeout for minimal
      
      try {
        // Try with --ignore-scripts to avoid build steps
        const process = await container.spawn('npm', [
          'install',
          '--prefer-offline',
          '--no-audit',
          '--no-fund',
          '--ignore-scripts',  // Skip postinstall scripts
          '--loglevel=error'
        ]);
        
        process.output.pipeTo(
          new WritableStream({
            write(data) {
              allOutput.push(data);
              onOutput?.(data);
            },
          })
        );
        
        const exitCode = await process.exit;
        clearTimeout(timeoutId);
        
        resolve({
          success: exitCode === 0,
          output: allOutput,
          errors: allErrors,
          exitCode,
        });
      } catch (err) {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          output: allOutput,
          errors: [String(err)],
          exitCode: 1,
        });
      }
    });
    
    if (minimalResult.success) {
      onOutput?.('\n✅ Minimal dependencies installed (some scripts skipped)\n');
      return minimalResult;
    }
  } catch (err) {
    allErrors.push(String(err));
  }
  
  // Final fallback - report failure but allow caller to decide whether to proceed
  onOutput?.('\n❌ npm install failed after all attempts\n');
  onOutput?.('   Some packages may be missing. The app may still run if core dependencies are cached.\n');
  return {
    success: false, // Report the actual failure
    output: allOutput,
    errors: [...allErrors, 'Installation failed after all retries'],
    exitCode: 1,
  };
}

export async function runNpmInstall(
  packages: string[],
  isDev: boolean = false,
  onOutput?: (data: string) => void,
  timeoutMs: number = 60000
): Promise<RunResult> {
  const container = await getWebContainer();
  const output: string[] = [];
  const errors: string[] = [];
  
  const args = [
    'install',
    ...packages,
    '--prefer-offline',
    '--no-audit',
    '--no-fund',
    '--loglevel=error',
    '--fetch-retries=1',
    '--fetch-timeout=15000'
  ];
  
  if (isDev) {
    args.push('--save-dev');
  }
  
  return new Promise(async (resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({
        success: false,
        output,
        errors: ['Timeout'],
        exitCode: -1,
      });
    }, timeoutMs);
    
    try {
      const process = await container.spawn('npm', args);
      
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
      const errStr = String(err);
      errors.push(errStr);
      resolve({
        success: false,
        output,
        errors: [errStr],
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

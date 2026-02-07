import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { runnerLog } from './logger';

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
    const entries = await container.fs.readdir('node_modules');
    runnerLog.debug('FileSystem', `node_modules check: ${entries.length} entries found`);
    return true;
  } catch {
    runnerLog.debug('FileSystem', 'node_modules check: not found');
    return false;
  }
}

export function setPackageJsonHash(packageJson: string): boolean {
  const newHash = simpleHash(packageJson);
  const changed = lastPackageJsonHash !== newHash;
  if (changed) {
    runnerLog.info('Cache', `package.json hash changed: ${lastPackageJsonHash || '(none)'} → ${newHash}`);
  } else {
    runnerLog.debug('Cache', `package.json hash unchanged: ${newHash}`);
  }
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
  runnerLog.info('PreWarm', `[${status}] ${message}`);
  preWarmListeners.forEach(l => l(status, message));
}

export function getPreWarmedPackages(): { deps: Record<string, string>; devDeps: Record<string, string> } {
  return { deps: { ...CORE_PACKAGES }, devDeps: { ...CORE_DEV_PACKAGES } };
}

export async function preWarmWebContainer(): Promise<boolean> {
  if (preWarmStatus === 'ready') {
    runnerLog.debug('PreWarm', 'Already warmed, skipping');
    return true;
  }
  if (preWarmPromise && preWarmStatus !== 'failed') {
    runnerLog.debug('PreWarm', 'Already in progress, waiting...');
    return preWarmPromise;
  }

  runnerLog.separator('PRE-WARM START');
  runnerLog.startTimer('prewarm-total');

  preWarmPromise = (async () => {
    try {
      preWarmStatus = 'booting';
      notifyPreWarm('booting', 'Starting WebContainer environment...');

      runnerLog.startTimer('prewarm-boot');
      const container = await getWebContainer();
      const bootTime = runnerLog.endTimer('prewarm-boot');
      runnerLog.success('PreWarm', 'WebContainer booted', undefined, bootTime);
      notifyPreWarm('booting', 'Environment ready');

      preWarmStatus = 'installing';
      const depCount = Object.keys(CORE_PACKAGES).length;
      const devDepCount = Object.keys(CORE_DEV_PACKAGES).length;
      runnerLog.info('PreWarm', `Installing ${depCount} deps + ${devDepCount} devDeps`, {
        dependencies: Object.keys(CORE_PACKAGES).join(', '),
        devDependencies: Object.keys(CORE_DEV_PACKAGES).join(', '),
      });
      notifyPreWarm('installing', `Pre-installing ${depCount + devDepCount} core packages...`);

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
      runnerLog.debug('FileSystem', 'Wrote pre-warm package.json', { size: `${minimalPkg.length} bytes` });

      const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
`;
      await container.fs.writeFile('vite.config.ts', viteConfig);
      runnerLog.debug('FileSystem', 'Wrote pre-warm vite.config.ts');

      runnerLog.startTimer('prewarm-npm');
      const installProcess = await container.spawn('npm', [
        'install',
        '--prefer-offline',
        '--no-audit',
        '--no-fund',
        '--loglevel=error',
        '--fetch-retries=2',
        '--fetch-timeout=30000'
      ]);
      runnerLog.info('NPM', 'Spawned npm install for pre-warm', {
        flags: '--prefer-offline --no-audit --no-fund --loglevel=error'
      });

      let installOutput = '';
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            installOutput += data;
            const trimmed = data.trim();
            if (trimmed) {
              if (trimmed.includes('added')) {
                runnerLog.success('NPM', trimmed);
                notifyPreWarm('installing', trimmed);
              } else if (trimmed.includes('WARN') || trimmed.includes('warn')) {
                runnerLog.warn('NPM', trimmed);
              } else if (trimmed.includes('ERR') || trimmed.includes('error')) {
                runnerLog.error('NPM', trimmed);
              } else {
                runnerLog.debug('NPM', trimmed);
              }
            }
          },
        })
      );

      const exitCode = await installProcess.exit;
      const npmTime = runnerLog.endTimer('prewarm-npm');

      if (exitCode === 0) {
        preWarmStatus = 'ready';
        const totalTime = runnerLog.endTimer('prewarm-total');
        runnerLog.success('PreWarm', `Pre-warm complete! ${depCount + devDepCount} packages cached`, {
          npmInstallTime: `${npmTime}ms`,
          totalTime: `${totalTime}ms`,
          exitCode,
        }, totalTime);
        runnerLog.separator('PRE-WARM DONE');
        notifyPreWarm('ready', 'Core packages pre-installed');
        return true;
      } else {
        preWarmStatus = 'failed';
        preWarmPromise = null;
        runnerLog.endTimer('prewarm-total');
        runnerLog.error('PreWarm', 'npm install failed during pre-warm', {
          exitCode,
          npmTime: `${npmTime}ms`,
          output: installOutput.slice(-500),
        });
        runnerLog.separator('PRE-WARM FAILED');
        notifyPreWarm('failed', `Pre-install failed (exit code ${exitCode}), will install on demand`);
        return false;
      }
    } catch (err) {
      preWarmStatus = 'failed';
      preWarmPromise = null;
      runnerLog.endTimer('prewarm-total');
      const errMsg = err instanceof Error ? err.message : String(err);
      runnerLog.error('PreWarm', `Pre-warm error: ${errMsg}`, {
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        stack: err instanceof Error ? err.stack?.split('\n').slice(0, 3).join(' | ') : undefined,
      });
      runnerLog.separator('PRE-WARM FAILED');
      notifyPreWarm('failed', `Pre-warm error: ${errMsg}`);
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
    runnerLog.debug('WebContainer', 'Waiting for existing boot promise...');
    return bootPromise;
  }
  
  runnerLog.info('WebContainer', 'Booting WebContainer...', { coep: 'credentialless' });
  runnerLog.startTimer('wc-boot');
  bootPromise = WebContainer.boot({ coep: 'credentialless' });
  webcontainerInstance = await bootPromise;
  const bootMs = runnerLog.endTimer('wc-boot');
  runnerLog.success('WebContainer', 'WebContainer booted successfully', undefined, bootMs);
  return webcontainerInstance;
}

export async function mountFiles(files: FileSystemTree): Promise<void> {
  const fileCount = countFiles(files);
  runnerLog.info('FileSystem', `Mounting ${fileCount} files...`);
  runnerLog.startTimer('mount-files');
  const container = await getWebContainer();
  await container.mount(files);
  const mountMs = runnerLog.endTimer('mount-files');
  runnerLog.success('FileSystem', `Mounted ${fileCount} files`, undefined, mountMs);
}

function countFiles(tree: FileSystemTree, depth = 0): number {
  let count = 0;
  for (const key of Object.keys(tree)) {
    const entry = tree[key];
    if ('file' in entry) {
      count++;
    } else if ('directory' in entry) {
      count += countFiles(entry.directory, depth + 1);
    }
  }
  return count;
}

export async function writeFile(path: string, contents: string): Promise<void> {
  const container = await getWebContainer();
  await container.fs.writeFile(path, contents);
  runnerLog.debug('FileSystem', `Wrote file: ${path}`, { size: `${contents.length} bytes` });
}

export async function readFile(path: string): Promise<string> {
  const container = await getWebContainer();
  const content = await container.fs.readFile(path, 'utf-8');
  runnerLog.debug('FileSystem', `Read file: ${path}`, { size: `${content.length} bytes` });
  return content;
}

export async function runCommand(
  command: string,
  args: string[] = [],
  onOutput?: (data: string) => void
): Promise<RunResult> {
  const container = await getWebContainer();
  const output: string[] = [];
  const errors: string[] = [];
  
  const cmdStr = `${command} ${args.join(' ')}`;
  runnerLog.info('Process', `Spawning: ${cmdStr}`);
  runnerLog.startTimer(`cmd-${cmdStr}`);
  
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
  const cmdMs = runnerLog.endTimer(`cmd-${cmdStr}`);
  
  if (exitCode === 0) {
    runnerLog.success('Process', `Command completed: ${cmdStr}`, { exitCode }, cmdMs);
  } else {
    runnerLog.error('Process', `Command failed: ${cmdStr}`, {
      exitCode,
      lastOutput: output.slice(-3).join('').trim().slice(-200),
    });
  }
  
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
  
  runnerLog.separator('NPM INSTALL');
  runnerLog.startTimer('npm-install-total');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const output: string[] = [];
    const errors: string[] = [];
    let timedOut = false;
    
    runnerLog.info('NPM', `Install attempt ${attempt}/${maxRetries}`, {
      timeout: `${Math.round(timeoutMs / 1000)}s`,
      flags: '--prefer-offline --no-audit --no-fund --loglevel=error'
    });
    onOutput?.(`\n📦 npm install attempt ${attempt}/${maxRetries}...\n`);
    
    runnerLog.startTimer(`npm-attempt-${attempt}`);
    const result = await new Promise<RunResult>(async (resolve) => {
      const timeoutId = setTimeout(() => {
        timedOut = true;
        runnerLog.warn('NPM', `Attempt ${attempt} timed out after ${Math.round(timeoutMs / 1000)}s`);
        onOutput?.(`\n⚠️ Attempt ${attempt} timed out after ${Math.round(timeoutMs/1000)}s\n`);
        resolve({
          success: false,
          output: [...output],
          errors: ['Timeout'],
          exitCode: -1,
        });
      }, timeoutMs);
      
      try {
        const process = await container.spawn('npm', [
          'install',
          '--prefer-offline',
          '--no-audit',
          '--no-fund',
          '--loglevel=error',
          '--fetch-retries=2',
          '--fetch-timeout=30000'
        ]);
        
        process.output.pipeTo(
          new WritableStream({
            write(data) {
              output.push(data);
              allOutput.push(data);
              onOutput?.(data);
              const trimmed = data.trim();
              if (trimmed) {
                if (trimmed.includes('added')) {
                  runnerLog.success('NPM', trimmed);
                } else if (trimmed.includes('WARN') || trimmed.includes('warn')) {
                  runnerLog.warn('NPM', trimmed);
                } else if (trimmed.includes('ERR') || trimmed.includes('error')) {
                  runnerLog.error('NPM', trimmed);
                }
              }
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
        runnerLog.error('NPM', `Spawn error on attempt ${attempt}: ${errStr}`);
        resolve({
          success: false,
          output,
          errors: [errStr],
          exitCode: 1,
        });
      }
    });
    
    const attemptMs = runnerLog.endTimer(`npm-attempt-${attempt}`);
    
    if (result.success) {
      const totalMs = runnerLog.endTimer('npm-install-total');
      runnerLog.success('NPM', `Dependencies installed successfully on attempt ${attempt}`, {
        attemptTime: `${attemptMs}ms`,
        totalTime: `${totalMs}ms`,
      }, totalMs);
      runnerLog.separator('NPM INSTALL DONE');
      onOutput?.('\n✅ Dependencies installed successfully!\n');
      return {
        success: true,
        output: allOutput,
        errors: allErrors,
        exitCode: 0,
      };
    }
    
    runnerLog.warn('NPM', `Attempt ${attempt} failed`, {
      exitCode: result.exitCode,
      timedOut,
      attemptTime: `${attemptMs}ms`,
      reason: timedOut ? 'timeout' : `exit code ${result.exitCode}`,
    });
    
    if (attempt < maxRetries) {
      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      runnerLog.info('NPM', `Retrying in ${backoffMs / 1000}s...`);
      onOutput?.(`\n🔄 Retrying in ${backoffMs/1000}s...\n`);
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  
  runnerLog.warn('NPM', 'Standard install failed after all retries, trying minimal install...');
  onOutput?.('\n⚠️ Standard install failed, trying minimal install...\n');
  
  try {
    runnerLog.startTimer('npm-minimal');
    const minimalResult = await new Promise<RunResult>(async (resolve) => {
      const timeoutId = setTimeout(() => {
        runnerLog.error('NPM', 'Minimal install timed out (60s)');
        resolve({
          success: false,
          output: [],
          errors: ['Minimal install timed out'],
          exitCode: -1,
        });
      }, 60000);
      
      try {
        runnerLog.info('NPM', 'Trying --ignore-scripts fallback');
        const process = await container.spawn('npm', [
          'install',
          '--prefer-offline',
          '--no-audit',
          '--no-fund',
          '--ignore-scripts',
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
    
    const minimalMs = runnerLog.endTimer('npm-minimal');
    
    if (minimalResult.success) {
      const totalMs = runnerLog.endTimer('npm-install-total');
      runnerLog.success('NPM', 'Minimal install succeeded (some scripts skipped)', {
        minimalTime: `${minimalMs}ms`,
        totalTime: `${totalMs}ms`,
      }, totalMs);
      runnerLog.separator('NPM INSTALL DONE (MINIMAL)');
      onOutput?.('\n✅ Minimal dependencies installed (some scripts skipped)\n');
      return minimalResult;
    }
    
    runnerLog.error('NPM', 'Minimal install also failed', { minimalTime: `${minimalMs}ms` });
  } catch (err) {
    allErrors.push(String(err));
    runnerLog.error('NPM', `Minimal install error: ${err}`);
  }
  
  runnerLog.endTimer('npm-install-total');
  runnerLog.error('NPM', 'All install attempts exhausted', {
    totalAttempts: maxRetries + 1,
    errors: allErrors.slice(-3),
  });
  runnerLog.separator('NPM INSTALL FAILED');
  onOutput?.('\n❌ npm install failed after all attempts\n');
  onOutput?.('   Some packages may be missing. The app may still run if core dependencies are cached.\n');
  return {
    success: false,
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
  
  const pkgList = packages.join(', ');
  const installType = isDev ? 'devDependency' : 'dependency';
  runnerLog.info('NPM', `Installing ${packages.length} ${installType} packages: ${pkgList}`);
  runnerLog.startTimer(`npm-pkg-${pkgList.slice(0, 30)}`);
  
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
      runnerLog.error('NPM', `Package install timed out after ${Math.round(timeoutMs / 1000)}s`, {
        packages: pkgList,
        type: installType,
      });
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
            const trimmed = data.trim();
            if (trimmed && (trimmed.includes('added') || trimmed.includes('WARN') || trimmed.includes('ERR'))) {
              if (trimmed.includes('added')) {
                runnerLog.success('NPM', trimmed);
              } else if (trimmed.includes('WARN')) {
                runnerLog.warn('NPM', trimmed);
              } else {
                runnerLog.error('NPM', trimmed);
              }
            }
          },
        })
      );
      
      const exitCode = await process.exit;
      clearTimeout(timeoutId);
      
      const timerKey = `npm-pkg-${pkgList.slice(0, 30)}`;
      const pkgMs = runnerLog.endTimer(timerKey);
      
      if (exitCode === 0) {
        runnerLog.success('NPM', `Installed ${packages.length} ${installType} packages`, {
          packages: pkgList,
        }, pkgMs);
      } else {
        runnerLog.error('NPM', `Failed to install ${installType} packages`, {
          packages: pkgList,
          exitCode,
          lastOutput: output.slice(-2).join('').trim().slice(-200),
        });
      }
      
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
      runnerLog.error('NPM', `Spawn error during package install: ${errStr}`, {
        packages: pkgList,
        type: installType,
      });
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
  runnerLog.info('Process', `Running node script: ${scriptPath}`);
  return runCommand('node', [scriptPath], onOutput);
}

export async function startDevServer(
  onOutput?: (data: string) => void,
  onServerReady?: (url: string) => void
): Promise<{ url: string; process: any }> {
  const container = await getWebContainer();
  
  runnerLog.separator('DEV SERVER START');
  runnerLog.info('DevServer', 'Starting development server (npm run dev)...');
  runnerLog.startTimer('dev-server-startup');
  
  const process = await container.spawn('npm', ['run', 'dev']);
  runnerLog.debug('DevServer', 'Dev server process spawned');
  
  process.output.pipeTo(
    new WritableStream({
      write(data) {
        onOutput?.(data);
        const trimmed = data.trim();
        if (trimmed) {
          if (trimmed.includes('error') || trimmed.includes('Error') || trimmed.includes('ERR')) {
            runnerLog.error('DevServer', trimmed);
          } else if (trimmed.includes('warn') || trimmed.includes('WARN')) {
            runnerLog.warn('DevServer', trimmed);
          } else if (trimmed.includes('ready') || trimmed.includes('localhost') || trimmed.includes('Local:')) {
            runnerLog.success('DevServer', trimmed);
          } else {
            runnerLog.debug('DevServer', trimmed);
          }
        }
      },
    })
  );
  
  return new Promise((resolve) => {
    container.on('server-ready', (port, url) => {
      const startupMs = runnerLog.endTimer('dev-server-startup');
      runnerLog.success('DevServer', `Server ready at ${url} (port ${port})`, {
        port,
        url,
      }, startupMs);
      runnerLog.separator('DEV SERVER READY');
      onServerReady?.(url);
      resolve({ url, process });
    });
  });
}

export function isWebContainerSupported(): boolean {
  const supported = typeof SharedArrayBuffer !== 'undefined';
  return supported;
}

export async function teardown(): Promise<void> {
  if (webcontainerInstance) {
    runnerLog.info('WebContainer', 'Tearing down WebContainer...');
    runnerLog.startTimer('wc-teardown');
    await webcontainerInstance.teardown();
    const teardownMs = runnerLog.endTimer('wc-teardown');
    runnerLog.success('WebContainer', 'WebContainer torn down', undefined, teardownMs);
    webcontainerInstance = null;
    bootPromise = null;
    preWarmStatus = 'idle';
    preWarmPromise = null;
    lastPackageJsonHash = null;
  } else {
    runnerLog.debug('WebContainer', 'Teardown called but no instance exists');
  }
}

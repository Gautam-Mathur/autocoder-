import { WebContainer, FileSystemTree } from '@webcontainer/api';
import { runnerLog, NpmOutputParser } from './logger';

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;
let lastPackageJsonHash: string | null = null;
let preWarmPromise: Promise<boolean> | null = null;
let preWarmStatus: 'idle' | 'booting' | 'installing' | 'ready' | 'failed' = 'idle';
let preWarmListeners: Array<(status: string, message: string) => void> = [];
let preWarmProcess: { kill: () => void } | null = null;

const STALL_TIMEOUT_MS = 45000;
const ALTERNATIVE_REGISTRIES = [
  'https://registry.npmmirror.com',
  'https://registry.npmjs.org',
];

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
  'react-hook-form': '^7.50.0',
  '@hookform/resolvers': '^3.3.0',
  'framer-motion': '^11.0.0',
};

const CORE_DEV_PACKAGES: Record<string, string> = {
  'vite': '^5.1.0',
  '@vitejs/plugin-react': '^4.2.0',
  'tailwindcss': '^3.4.1',
  'postcss': '^8.4.35',
  'autoprefixer': '^10.4.17',
  'fast-glob': '^3.3.2',
};

export interface RunResult {
  success: boolean;
  output: string[];
  errors: string[];
  exitCode: number;
}

async function checkRegistryConnectivity(container: WebContainer): Promise<{ reachable: boolean; registry?: string }> {
  runnerLog.startTimer('registry-check');
  try {
    const proc = await container.spawn('npm', ['ping', '--registry=https://registry.npmjs.org']);
    let output = '';
    proc.output.pipeTo(new WritableStream({ write(data) { output += data; } }));
    const exitCode = await Promise.race([
      proc.exit,
      new Promise<number>(r => setTimeout(() => { try { proc.kill(); } catch {} r(-1); }, 15000)),
    ]);
    const ms = runnerLog.endTimer('registry-check');
    if (exitCode === 0) {
      runnerLog.success('NPM', 'Registry reachable (npmjs.org)', undefined, ms);
      return { reachable: true, registry: 'https://registry.npmjs.org' };
    }
  } catch {}

  for (const alt of ALTERNATIVE_REGISTRIES) {
    try {
      const proc = await container.spawn('npm', ['ping', `--registry=${alt}`]);
      let output = '';
      proc.output.pipeTo(new WritableStream({ write(data) { output += data; } }));
      const exitCode = await Promise.race([
        proc.exit,
        new Promise<number>(r => setTimeout(() => { try { proc.kill(); } catch {} r(-1); }, 10000)),
      ]);
      if (exitCode === 0) {
        runnerLog.success('NPM', `Alternative registry reachable: ${alt}`);
        return { reachable: true, registry: alt };
      }
    } catch {}
  }

  runnerLog.endTimer('registry-check');
  runnerLog.error('NPM', 'No npm registry is reachable from WebContainer');
  return { reachable: false };
}

interface StallAwareInstallOptions {
  container: WebContainer;
  args: string[];
  timeoutMs: number;
  stallTimeoutMs: number;
  onOutput?: (data: string) => void;
  label: string;
}

async function stallAwareNpmInstall(opts: StallAwareInstallOptions): Promise<RunResult & { stalledOut: boolean }> {
  const { container, args, timeoutMs, stallTimeoutMs, onOutput, label } = opts;
  const output: string[] = [];
  const errors: string[] = [];
  let lastActivityTime = Date.now();
  let stalledOut = false;

  return new Promise(async (resolve) => {
    let processRef: { kill: () => void } | null = null;

    const overallTimer = setTimeout(() => {
      runnerLog.warn('NPM', `${label}: Overall timeout (${Math.round(timeoutMs / 1000)}s)`);
      try { processRef?.kill(); } catch {}
      resolve({ success: false, output, errors: ['Timeout'], exitCode: -1, stalledOut: false });
    }, timeoutMs);

    const stallChecker = setInterval(() => {
      const silentMs = Date.now() - lastActivityTime;
      if (silentMs > stallTimeoutMs) {
        stalledOut = true;
        runnerLog.warn('NPM', `${label}: Stall detected — no output for ${Math.round(silentMs / 1000)}s, killing npm`);
        onOutput?.(`\n⚠ npm appears stuck (no activity for ${Math.round(silentMs / 1000)}s), restarting...\n`);
        clearInterval(stallChecker);
        try { processRef?.kill(); } catch {}
        clearTimeout(overallTimer);
        resolve({ success: false, output, errors: ['Stalled - no output'], exitCode: -2, stalledOut: true });
      }
    }, 5000);

    try {
      const process = await container.spawn('npm', args);
      processRef = process;

      const parser = new NpmOutputParser((line, level) => {
        if (level !== 'debug') onOutput?.(line + '\n');
      });

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            lastActivityTime = Date.now();
            output.push(data);
            parser.feed(data);
          },
        })
      );

      const exitCode = await process.exit;
      parser.flush();
      clearTimeout(overallTimer);
      clearInterval(stallChecker);

      resolve({
        success: exitCode === 0,
        output,
        errors,
        exitCode,
        stalledOut: false,
      });
    } catch (err) {
      clearTimeout(overallTimer);
      clearInterval(stallChecker);
      resolve({
        success: false,
        output,
        errors: [String(err)],
        exitCode: 1,
        stalledOut: false,
      });
    }
  });
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

export async function awaitPreWarm(timeoutMs: number = 120000): Promise<boolean> {
  if (preWarmStatus === 'ready') return true;
  if (preWarmStatus === 'failed' || preWarmStatus === 'idle') return false;
  if (!preWarmPromise) return false;

  runnerLog.info('PreWarm', `Awaiting pre-warm completion (status: ${preWarmStatus}, timeout: ${Math.round(timeoutMs / 1000)}s)...`);
  runnerLog.startTimer('await-prewarm');

  try {
    const result = await Promise.race([
      preWarmPromise,
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs)),
    ]);
    const ms = runnerLog.endTimer('await-prewarm');
    if (result) {
      runnerLog.success('PreWarm', `Pre-warm completed while waiting`, undefined, ms);
    } else {
      runnerLog.warn('PreWarm', `Pre-warm did not complete in time (${Math.round(timeoutMs / 1000)}s)`);
    }
    return result;
  } catch {
    runnerLog.warn('PreWarm', 'Pre-warm promise rejected while waiting');
    return false;
  }
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
      const PREWARM_TIMEOUT = 180000;
      const PREWARM_STALL_TIMEOUT = 60000;
      const installProcess = await container.spawn('npm', [
        'install',
        '--prefer-offline',
        '--no-audit',
        '--no-fund',
        '--loglevel=http',
        '--fetch-retries=2',
        '--fetch-timeout=30000'
      ]);
      preWarmProcess = installProcess;
      runnerLog.info('NPM', 'Spawned npm install for pre-warm', {
        flags: '--prefer-offline --no-audit --no-fund --loglevel=http',
        timeout: `${PREWARM_TIMEOUT / 1000}s`,
        stallTimeout: `${PREWARM_STALL_TIMEOUT / 1000}s`,
      });

      let installOutput = '';
      let lastPrewarmActivity = Date.now();
      const prewarmParser = new NpmOutputParser((line, level) => {
        if (level === 'success') notifyPreWarm('installing', line);
      });
      installProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            installOutput += data;
            lastPrewarmActivity = Date.now();
            prewarmParser.feed(data);
          },
        })
      );

      const stallCheckInterval = setInterval(() => {
        const silentMs = Date.now() - lastPrewarmActivity;
        if (silentMs > PREWARM_STALL_TIMEOUT) {
          runnerLog.warn('PreWarm', `npm stall detected — no output for ${Math.round(silentMs / 1000)}s, killing`);
          clearInterval(stallCheckInterval);
          try { installProcess.kill(); } catch {}
        }
      }, 10000);

      const exitCode = await Promise.race([
        installProcess.exit,
        new Promise<number>((resolve) => setTimeout(() => {
          runnerLog.warn('PreWarm', `npm install timed out after ${PREWARM_TIMEOUT / 1000}s, killing process`);
          try { installProcess.kill(); } catch {}
          resolve(-1);
        }, PREWARM_TIMEOUT)),
      ]);
      clearInterval(stallCheckInterval);
      preWarmProcess = null;
      prewarmParser.flush();
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
  
  const isIsolated = typeof window !== 'undefined' && window.crossOriginIsolated;
  runnerLog.info('WebContainer', 'Booting WebContainer...', { 
    coep: 'require-corp',
    crossOriginIsolated: isIsolated,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'unknown',
  });
  if (!isIsolated) {
    runnerLog.warn('WebContainer', 'crossOriginIsolated is FALSE - SharedArrayBuffer may not be available. Check server COOP/COEP headers.');
  }
  runnerLog.startTimer('wc-boot');
  bootPromise = WebContainer.boot();
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
  let registryArg: string | null = null;
  
  if (preWarmProcess || (preWarmStatus === 'installing' && preWarmPromise)) {
    runnerLog.info('NPM', 'Pre-warm npm install is still running, giving it 10s to finish...');
    onOutput?.('⏳ Waiting for background package cache to finish...\n');
    const preWarmDone = await awaitPreWarm(10000);
    
    if (preWarmDone) {
      runnerLog.success('NPM', 'Pre-warm completed! Cached packages will speed up install.');
      onOutput?.('✓ Background cache complete, proceeding with install\n');
    } else if (preWarmProcess) {
      runnerLog.warn('NPM', 'Pre-warm did not finish in time, killing it');
      onOutput?.('⚠ Cache still running, stopping it to proceed...\n');
      try { preWarmProcess.kill(); } catch {}
      preWarmProcess = null;
      preWarmStatus = 'failed';
    
      runnerLog.info('NPM', 'Waiting for pre-warm process to fully terminate...');
      await new Promise(r => setTimeout(r, 3000));
    
      try {
        runnerLog.info('NPM', 'Cleaning up npm lock files after pre-warm kill...');
        const cleanups = [
          container.spawn('rm', ['-rf', 'node_modules/.package-lock.json']),
          container.spawn('rm', ['-f', 'package-lock.json']),
        ];
        const cleanupResults = await Promise.allSettled(cleanups.map(async (p) => {
          const proc = await p;
          await proc.exit;
        }));
        runnerLog.debug('NPM', 'Lock file cleanup done', {
          results: cleanupResults.map(r => r.status).join(', ')
        });
        await new Promise(r => setTimeout(r, 500));
      } catch (cleanErr) {
        runnerLog.debug('NPM', `Lock cleanup error (non-fatal): ${String(cleanErr)}`);
      }
    }
  }

  runnerLog.separator('NPM INSTALL');
  runnerLog.startTimer('npm-install-total');

  runnerLog.info('NPM', 'Checking npm registry connectivity...');
  onOutput?.('🔍 Checking npm registry connectivity...\n');
  const connectivity = await checkRegistryConnectivity(container);
  if (!connectivity.reachable) {
    runnerLog.error('NPM', 'Cannot reach any npm registry — network issue in WebContainer');
    onOutput?.('❌ Cannot reach npm registry. This is usually a network issue.\n');
    onOutput?.('   Try: 1) Check your internet connection  2) Disable VPN/proxy  3) Restart the app\n');
    allErrors.push('No npm registry reachable');
  } else {
    onOutput?.(`✓ Registry reachable: ${connectivity.registry}\n`);
    if (connectivity.registry && connectivity.registry !== 'https://registry.npmjs.org') {
      registryArg = `--registry=${connectivity.registry}`;
      runnerLog.info('NPM', `Using alternative registry: ${connectivity.registry}`);
      onOutput?.(`📦 Using mirror registry for faster downloads\n`);
    }
  }
  
  let stallCount = 0;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const baseArgs = [
      'install',
      '--prefer-offline',
      '--no-audit',
      '--no-fund',
      '--loglevel=http',
      '--fetch-retries=2',
      '--fetch-timeout=30000'
    ];
    if (registryArg) baseArgs.push(registryArg);
    
    runnerLog.info('NPM', `Install attempt ${attempt}/${maxRetries}`, {
      timeout: `${Math.round(timeoutMs / 1000)}s`,
      stallTimeout: `${Math.round(STALL_TIMEOUT_MS / 1000)}s`,
      flags: baseArgs.slice(1).join(' '),
    });
    onOutput?.(`\n--- npm install attempt ${attempt}/${maxRetries}...\n`);
    
    runnerLog.startTimer(`npm-attempt-${attempt}`);
    
    const result = await stallAwareNpmInstall({
      container,
      args: baseArgs,
      timeoutMs,
      stallTimeoutMs: STALL_TIMEOUT_MS,
      onOutput,
      label: `Attempt ${attempt}`,
    });
    
    const attemptMs = runnerLog.endTimer(`npm-attempt-${attempt}`);
    
    if (result.success) {
      const totalMs = runnerLog.endTimer('npm-install-total');
      runnerLog.success('NPM', `Dependencies installed successfully on attempt ${attempt}`, {
        attemptTime: `${attemptMs}ms`,
        totalTime: `${totalMs}ms`,
      }, totalMs);
      runnerLog.separator('NPM INSTALL DONE');
      onOutput?.(`\n✅ Dependencies installed successfully!\n`);
      return {
        success: true,
        output: allOutput.concat(result.output),
        errors: allErrors,
        exitCode: 0,
      };
    }

    if (result.stalledOut) stallCount++;
    
    runnerLog.warn('NPM', `Attempt ${attempt} failed`, {
      exitCode: result.exitCode,
      stalledOut: result.stalledOut,
      attemptTime: `${attemptMs}ms`,
      reason: result.stalledOut ? 'stall (no output)' : result.exitCode === -1 ? 'timeout' : `exit code ${result.exitCode}`,
    });
    allOutput.push(...result.output);
    allErrors.push(...result.errors);
    
    if (attempt < maxRetries) {
      const backoffMs = Math.min(2000 * Math.pow(2, attempt - 1), 15000);
      runnerLog.info('NPM', `Retrying in ${backoffMs / 1000}s (cleaning up first)...`);
      onOutput?.(`\n🔄 Retrying in ${Math.round(backoffMs/1000)}s...\n`);
      
      try {
        runnerLog.info('NPM', 'Cleaning npm cache/locks before retry...');
        const rmLock = await container.spawn('rm', ['-f', 'package-lock.json']);
        await rmLock.exit;
        const rmPkgLock = await container.spawn('rm', ['-rf', 'node_modules/.package-lock.json']);
        await rmPkgLock.exit;
        
        if (attempt >= 2 || stallCount >= 2) {
          runnerLog.info('NPM', 'Removing node_modules for clean install');
          onOutput?.('🧹 Cleaning node_modules for fresh install...\n');
          const rmModules = await container.spawn('rm', ['-rf', 'node_modules']);
          await rmModules.exit;
          await new Promise(r => setTimeout(r, 1000));
        }

        if (stallCount >= 2 && !registryArg) {
          runnerLog.info('NPM', 'Multiple stalls detected, trying alternative registry...');
          onOutput?.('🔄 Trying alternative npm registry...\n');
          for (const alt of ALTERNATIVE_REGISTRIES) {
            const check = await checkRegistryConnectivity(container);
            if (check.reachable && check.registry) {
              registryArg = `--registry=${check.registry}`;
              runnerLog.info('NPM', `Switching to registry: ${check.registry}`);
              onOutput?.(`📦 Switched to: ${check.registry}\n`);
              break;
            }
          }
        }
      } catch (cleanErr) {
        runnerLog.debug('NPM', `Pre-retry cleanup error (non-fatal): ${String(cleanErr)}`);
      }
      
      await new Promise(r => setTimeout(r, backoffMs));
    }
  }
  
  runnerLog.warn('NPM', 'Standard install failed after all retries, trying minimal install...');
  onOutput?.('\n⚠️ Standard install failed, trying minimal install...\n');
  
  try {
    runnerLog.info('NPM', 'Full cleanup before minimal install fallback');
    onOutput?.('🧹 Cleaning everything for fresh minimal install...\n');
    const rmAll = await container.spawn('rm', ['-rf', 'node_modules', 'package-lock.json']);
    await rmAll.exit;
    await new Promise(r => setTimeout(r, 1000));
    
    runnerLog.startTimer('npm-minimal');

    const minimalArgs = [
      'install',
      '--prefer-offline',
      '--no-audit',
      '--no-fund',
      '--ignore-scripts',
      '--loglevel=http'
    ];
    if (registryArg) minimalArgs.push(registryArg);
    
    const minimalResult = await stallAwareNpmInstall({
      container,
      args: minimalArgs,
      timeoutMs: 90000,
      stallTimeoutMs: STALL_TIMEOUT_MS,
      onOutput,
      label: 'Minimal install',
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
      return {
        success: true,
        output: allOutput.concat(minimalResult.output),
        errors: allErrors,
        exitCode: 0,
      };
    }
    
    runnerLog.error('NPM', 'Minimal install also failed', {
      minimalTime: `${minimalMs}ms`,
      stalledOut: minimalResult.stalledOut,
    });
  } catch (err) {
    allErrors.push(String(err));
    runnerLog.error('NPM', `Minimal install error: ${err}`);
  }
  
  runnerLog.endTimer('npm-install-total');
  const networkNote = stallCount > 0
    ? ' This appears to be a network/connectivity issue — npm could not download packages.'
    : '';
  runnerLog.error('NPM', 'All install attempts exhausted', {
    totalAttempts: maxRetries + 1,
    stallCount,
    errors: allErrors.slice(-3),
  });
  runnerLog.separator('NPM INSTALL FAILED');
  onOutput?.(`\n❌ npm install failed after all attempts.${networkNote}\n`);
  if (stallCount > 0) {
    onOutput?.('   Possible fixes:\n');
    onOutput?.('   1. Check your internet connection\n');
    onOutput?.('   2. Disable VPN or proxy if active\n');
    onOutput?.('   3. Try using Node.js LTS (v20.x) instead of v24\n');
    onOutput?.('   4. Close and reopen the app to reset WebContainer\n');
  } else {
    onOutput?.('   Some packages may be missing. The app may still run if core dependencies are cached.\n');
  }
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
    '--loglevel=http',
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
      const pkgParser = new NpmOutputParser((line, level) => {
        if (level !== 'debug') onOutput?.(line + '\n');
      });
      const process = await container.spawn('npm', args);
      
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output.push(data);
            pkgParser.feed(data);
          },
        })
      );
      
      const exitCode = await process.exit;
      pkgParser.flush();
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

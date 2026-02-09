import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger.js';
import { npmCache } from './npm-cache.js';

export type LogCallback = (log: string) => void;
export type ProgressCallback = (percent: number, message: string) => void;

export class LocalRunner {
  private currentProcess: ChildProcess | null = null;
  private serverUrl: string | null = null;
  private serverPort = 5200;

  async writeFiles(projectPath: string, files: Array<{ path: string; content: string }>): Promise<void> {
    logger.startTimer('write-files');
    logger.info('FileSystem', `Writing ${files.length} files to ${projectPath}`);
    let dirsCreated = 0;

    for (const file of files) {
      const fullPath = path.join(projectPath, file.path);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        dirsCreated++;
      }
      
      fs.writeFileSync(fullPath, file.content, 'utf-8');
    }

    const elapsed = logger.endTimer('write-files');
    logger.success('FileSystem', `Wrote ${files.length} files (${dirsCreated} dirs created)`, {
      projectPath,
      fileCount: files.length,
      dirsCreated,
    }, elapsed);
  }

  private countDependencies(projectPath: string): { deps: number; devDeps: number; total: number; names: string[] } {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) return { deps: 0, devDeps: 0, total: 0, names: [] };
      
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const depNames = Object.keys(packageJson.dependencies || {});
      const devDepNames = Object.keys(packageJson.devDependencies || {});
      return {
        deps: depNames.length,
        devDeps: devDepNames.length,
        total: depNames.length + devDepNames.length,
        names: [...depNames, ...devDepNames],
      };
    } catch {
      return { deps: 0, devDeps: 0, total: 0, names: [] };
    }
  }

  private bulkCopyCache(projectPath: string, onLog: LogCallback, onProgress?: ProgressCallback): { copied: boolean; missing: string[] } {
    if (!npmCache.ready) {
      logger.info('NpmCache', 'Offline cache not ready, skipping bulk copy');
      return { copied: false, missing: [] };
    }

    const depInfo = this.countDependencies(projectPath);
    if (depInfo.total === 0) return { copied: false, missing: [] };

    const nodeModulesDest = path.join(projectPath, 'node_modules');
    const cachePath = npmCache.cachePath;

    logger.startTimer('bulk-copy-cache');
    logger.info('NpmCache', `Bulk-copying cached node_modules to project (${depInfo.total} deps requested)`);
    onLog('[AutoCoder] 📦 Copying package cache into project...');
    onProgress?.(5, 'Copying cached packages...');

    try {
      if (!fs.existsSync(nodeModulesDest)) {
        fs.mkdirSync(nodeModulesDest, { recursive: true });
      }
      fs.cpSync(cachePath, nodeModulesDest, { recursive: true, force: true });
    } catch (err) {
      logger.error('NpmCache', `Bulk copy failed: ${err}`);
      onLog('[AutoCoder] ⚠ Cache copy failed, will fall back to npm install');
      return { copied: false, missing: depInfo.names };
    }

    const elapsed = logger.endTimer('bulk-copy-cache');
    logger.success('NpmCache', 'Bulk copy of node_modules complete', { projectPath }, elapsed);
    onProgress?.(50, 'Package cache copied, verifying packages...');

    const packageJsonPath = path.join(projectPath, 'package.json');
    let allDeps: Record<string, string> = {};
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    } catch {}

    const missing: string[] = [];
    for (const dep of depInfo.names) {
      const requiredRange = allDeps[dep] || '*';
      if (!npmCache.verifyInstalledPackage(nodeModulesDest, dep, requiredRange)) {
        missing.push(dep);
      }
    }

    if (missing.length === 0) {
      onLog(`[AutoCoder] ✓ All ${depInfo.total} packages loaded from cache — no download needed`);
      logger.success('NpmCache', `All ${depInfo.total} requested deps verified in cache, npm install skipped`);
    } else {
      onLog(`[AutoCoder] ✓ Cache loaded, ${missing.length} extra package(s) need downloading: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}`);
      logger.info('NpmCache', `${depInfo.total - missing.length} cached, ${missing.length} missing: ${missing.join(', ')}`);
    }

    return { copied: true, missing };
  }

  private copyDirRecursive(src: string, dest: string) {
    fs.cpSync(src, dest, { recursive: true, force: true });
  }

  private runNpmInstall(
    projectPath: string,
    onLog: LogCallback,
    onProgress?: ProgressCallback,
    extraArgs: string[] = [],
    startPercent = 0,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const depInfo = this.countDependencies(projectPath);
      let installedCount = 0;
      let lastPercent = startPercent;

      const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const npmArgs = ['install', '--progress', ...extraArgs];
      const child = spawn(npm, npmArgs, {
        cwd: projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      });

      logger.debug('Process', `Spawned npm install (PID: ${child.pid})`, {
        command: `${npm} ${npmArgs.join(' ')}`,
        cwd: projectPath,
      });

      const updateProgress = (line: string) => {
        if (depInfo.total === 0) {
          onProgress?.(50, 'Installing packages...');
          return;
        }

        const addedMatch = line.match(/added (\d+) package/i);
        if (addedMatch) {
          installedCount = parseInt(addedMatch[1], 10);
          const percent = Math.min(Math.round((installedCount / Math.max(depInfo.total, installedCount)) * 100), 99);
          if (percent > lastPercent) {
            lastPercent = percent;
            onProgress?.(percent, `Installed ${installedCount} packages...`);
          }
          return;
        }

        const httpMatch = line.match(/http fetch (GET|POST)/i);
        if (httpMatch && lastPercent < 30) {
          lastPercent = Math.min(lastPercent + 2, 30);
          onProgress?.(lastPercent, 'Fetching packages...');
          return;
        }

        const reifyMatch = line.match(/reify:/i);
        if (reifyMatch && lastPercent < 60) {
          lastPercent = Math.min(lastPercent + 5, 60);
          onProgress?.(lastPercent, 'Extracting packages...');
          return;
        }

        const buildMatch = line.match(/timing build/i);
        if (buildMatch && lastPercent < 90) {
          lastPercent = Math.min(lastPercent + 3, 90);
          onProgress?.(lastPercent, 'Building packages...');
        }
      };

      child.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach((line: string) => {
          onLog(`[npm] ${line}`);
          updateProgress(line);

          if (line.includes('added') && line.includes('package')) {
            logger.success('NPM', line.trim());
          } else if (line.toLowerCase().includes('warn')) {
            logger.warn('NPM', line.trim());
          } else if (line.toLowerCase().includes('error') || line.toLowerCase().includes('err!')) {
            logger.error('NPM', line.trim());
          } else {
            logger.debug('NPM', line.trim());
          }
        });
      });

      child.stderr?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach((line: string) => {
          onLog(`[npm] ${line}`);
          updateProgress(line);

          if (line.toLowerCase().includes('warn')) {
            logger.warn('NPM', line.trim());
          } else if (line.toLowerCase().includes('error') || line.toLowerCase().includes('err!')) {
            logger.error('NPM', line.trim());
          } else {
            logger.debug('NPM', line.trim());
          }
        });
      });

      child.on('error', (error) => {
        const elapsed = logger.endTimer('npm-install');
        logger.error('NPM', `npm install failed: ${error.message}`, { error: error.message }, elapsed);
        logger.separator('NPM INSTALL FAILED');
        onLog(`[AutoCoder] npm install failed: ${error.message}`);
        onProgress?.(0, `Error: ${error.message}`);
        resolve({ success: false, error: error.message });
      });

      child.on('close', (code) => {
        const elapsed = logger.endTimer('npm-install');
        if (code === 0) {
          logger.success('NPM', `npm install completed (${installedCount} packages added)`, {
            exitCode: code,
            projectPath,
          }, elapsed);
          logger.separator('NPM INSTALL DONE');
          onLog('[AutoCoder] npm install completed successfully');
          onProgress?.(100, 'Installation complete!');
          resolve({ success: true });
        } else {
          logger.error('NPM', `npm install failed with code ${code}`, {
            exitCode: code,
            projectPath,
          }, elapsed);
          logger.separator('NPM INSTALL FAILED');
          onLog(`[AutoCoder] npm install failed with code ${code}`);
          onProgress?.(0, `Failed with code ${code}`);
          resolve({ success: false, error: `npm install exited with code ${code}` });
        }
      });
    });
  }

  async npmInstall(
    projectPath: string, 
    onLog: LogCallback,
    onProgress?: ProgressCallback
  ): Promise<{ success: boolean; error?: string }> {
    const depInfo = this.countDependencies(projectPath);

    logger.separator('NPM INSTALL START');
    logger.startTimer('npm-install');
    logger.info('NPM', `Starting npm install (${depInfo.total} packages: ${depInfo.deps} deps + ${depInfo.devDeps} devDeps)`, {
      projectPath,
      packages: depInfo.names.slice(0, 20).join(', ') + (depInfo.names.length > 20 ? `... +${depInfo.names.length - 20} more` : ''),
    });

    const cacheResult = this.bulkCopyCache(projectPath, onLog, onProgress);

    if (cacheResult.copied && cacheResult.missing.length === 0) {
      onLog('[AutoCoder] All packages cached — running quick dependency check...');
      onProgress?.(80, 'Verifying dependency tree...');
      return this.runNpmInstall(projectPath, onLog, onProgress, ['--prefer-offline'], 80);
    }

    if (cacheResult.copied && cacheResult.missing.length > 0) {
      onLog(`[AutoCoder] Installing ${cacheResult.missing.length} extra packages...`);
      onProgress?.(55, `Installing ${cacheResult.missing.length} extra packages...`);
      return this.runNpmInstall(projectPath, onLog, onProgress, ['--prefer-offline'], 55);
    }

    onLog('[AutoCoder] Running full npm install...');
    onProgress?.(0, `Starting installation (${depInfo.total} packages)...`);
    return this.runNpmInstall(projectPath, onLog, onProgress);
  }

  async startDevServer(projectPath: string, onLog: LogCallback): Promise<{ success: boolean; url?: string; error?: string }> {
    if (this.currentProcess) {
      logger.info('DevServer', 'Stopping existing dev server before starting new one');
      await this.stopDevServer();
    }

    return new Promise((resolve) => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        logger.error('DevServer', 'package.json not found', { projectPath });
        resolve({ success: false, error: 'package.json not found' });
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      let command = 'npm';
      let args = ['run'];
      let scriptName = '';
      
      if (scripts.dev) {
        args.push('dev');
        scriptName = 'dev';
      } else if (scripts.start) {
        args.push('start');
        scriptName = 'start';
      } else {
        logger.error('DevServer', 'No dev or start script found in package.json', { 
          availableScripts: Object.keys(scripts) 
        });
        resolve({ success: false, error: 'No dev or start script found in package.json' });
        return;
      }

      logger.separator('DEV SERVER START');
      logger.startTimer('dev-server-start');
      logger.info('DevServer', `Starting dev server (script: "${scriptName}", port: ${this.serverPort})`, {
        projectPath,
        script: scriptName,
        port: this.serverPort,
      });

      onLog(`[AutoCoder] Starting dev server (port ${this.serverPort})...`);
      
      const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      this.currentProcess = spawn(npm, args, {
        cwd: projectPath,
        shell: true,
        env: { 
          ...process.env, 
          PORT: String(this.serverPort),
          FORCE_COLOR: '1',
        },
      });

      logger.debug('Process', `Spawned dev server (PID: ${this.currentProcess.pid})`, {
        command: `${npm} ${args.join(' ')}`,
        cwd: projectPath,
      });

      let serverStarted = false;
      const urlPattern = /localhost:(\d+)|http:\/\/127\.0\.0\.1:(\d+)|http:\/\/0\.0\.0\.0:(\d+)/;

      const handleOutput = (data: Buffer) => {
        const text = data.toString();
        const lines = text.split('\n').filter(Boolean);
        
        lines.forEach((line: string) => {
          onLog(`[dev] ${line}`);

          if (line.toLowerCase().includes('error')) {
            logger.error('DevServer', line.trim());
          } else if (line.toLowerCase().includes('warn')) {
            logger.warn('DevServer', line.trim());
          } else if (line.includes('ready') || line.includes('compiled') || line.includes('listening')) {
            logger.success('DevServer', line.trim());
          } else {
            logger.debug('DevServer', line.trim());
          }
          
          if (!serverStarted) {
            const match = line.match(urlPattern);
            if (match) {
              const port = match[1] || match[2] || match[3];
              this.serverUrl = `http://localhost:${port}`;
              serverStarted = true;
              const elapsed = logger.endTimer('dev-server-start');
              logger.success('DevServer', `Dev server ready at ${this.serverUrl}`, {
                port,
                url: this.serverUrl,
              }, elapsed);
              logger.separator('DEV SERVER READY');
              onLog(`[AutoCoder] Dev server ready at ${this.serverUrl}`);
              resolve({ success: true, url: this.serverUrl });
            }
          }
        });
      };

      this.currentProcess.stdout?.on('data', handleOutput);
      this.currentProcess.stderr?.on('data', handleOutput);

      this.currentProcess.on('error', (error) => {
        logger.error('DevServer', `Dev server error: ${error.message}`, { error: error.message });
        onLog(`[AutoCoder] Dev server error: ${error.message}`);
        if (!serverStarted) {
          logger.endTimer('dev-server-start');
          logger.separator('DEV SERVER FAILED');
          resolve({ success: false, error: error.message });
        }
      });

      this.currentProcess.on('close', (code) => {
        if (!serverStarted) {
          const elapsed = logger.endTimer('dev-server-start');
          logger.error('DevServer', `Dev server exited before ready (code ${code})`, { exitCode: code }, elapsed);
          logger.separator('DEV SERVER FAILED');
          onLog(`[AutoCoder] Dev server exited with code ${code}`);
          resolve({ success: false, error: `Server exited with code ${code}` });
        } else {
          logger.info('DevServer', `Dev server process exited (code ${code})`);
        }
        this.currentProcess = null;
        this.serverUrl = null;
      });

      setTimeout(() => {
        if (!serverStarted && this.currentProcess) {
          this.serverUrl = `http://localhost:${this.serverPort}`;
          const elapsed = logger.endTimer('dev-server-start');
          logger.warn('DevServer', `No URL detected, assuming server ready at ${this.serverUrl}`, {
            timeout: '10s',
            port: this.serverPort,
          }, elapsed);
          onLog(`[AutoCoder] Assuming server ready at ${this.serverUrl}`);
          serverStarted = true;
          resolve({ success: true, url: this.serverUrl });
        }
      }, 10000);
    });
  }

  async stopDevServer(): Promise<void> {
    if (this.currentProcess) {
      const pid = this.currentProcess.pid;
      logger.info('DevServer', `Stopping dev server (PID: ${pid})`);
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(pid), '/f', '/t']);
      } else {
        this.currentProcess.kill('SIGTERM');
      }
      this.currentProcess = null;
      this.serverUrl = null;
      logger.success('DevServer', 'Dev server stopped');
    }
  }

  isServerRunning(): boolean {
    return this.currentProcess !== null;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }

  cleanup(): void {
    logger.info('Runner', 'Cleaning up runner resources');
    this.stopDevServer();
  }
}

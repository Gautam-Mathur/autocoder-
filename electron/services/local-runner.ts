import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export type LogCallback = (log: string) => void;

export class LocalRunner {
  private currentProcess: ChildProcess | null = null;
  private serverUrl: string | null = null;
  private serverPort = 3000;

  async writeFiles(projectPath: string, files: Array<{ path: string; content: string }>): Promise<void> {
    for (const file of files) {
      const fullPath = path.join(projectPath, file.path);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, file.content, 'utf-8');
    }
  }

  async npmInstall(projectPath: string, onLog: LogCallback): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      onLog('[AutoCoder] Running npm install...');
      
      const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      const child = spawn(npm, ['install'], {
        cwd: projectPath,
        shell: true,
        env: { ...process.env, FORCE_COLOR: '1' },
      });

      child.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach((line: string) => onLog(`[npm] ${line}`));
      });

      child.stderr?.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach((line: string) => onLog(`[npm] ${line}`));
      });

      child.on('error', (error) => {
        onLog(`[AutoCoder] npm install failed: ${error.message}`);
        resolve({ success: false, error: error.message });
      });

      child.on('close', (code) => {
        if (code === 0) {
          onLog('[AutoCoder] npm install completed successfully');
          resolve({ success: true });
        } else {
          onLog(`[AutoCoder] npm install failed with code ${code}`);
          resolve({ success: false, error: `npm install exited with code ${code}` });
        }
      });
    });
  }

  async startDevServer(projectPath: string, onLog: LogCallback): Promise<{ success: boolean; url?: string; error?: string }> {
    if (this.currentProcess) {
      await this.stopDevServer();
    }

    return new Promise((resolve) => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      
      if (!fs.existsSync(packageJsonPath)) {
        resolve({ success: false, error: 'package.json not found' });
        return;
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      let command = 'npm';
      let args = ['run'];
      
      if (scripts.dev) {
        args.push('dev');
      } else if (scripts.start) {
        args.push('start');
      } else {
        resolve({ success: false, error: 'No dev or start script found in package.json' });
        return;
      }

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

      let serverStarted = false;
      const urlPattern = /localhost:(\d+)|http:\/\/127\.0\.0\.1:(\d+)|http:\/\/0\.0\.0\.0:(\d+)/;

      const handleOutput = (data: Buffer) => {
        const text = data.toString();
        const lines = text.split('\n').filter(Boolean);
        
        lines.forEach((line: string) => {
          onLog(`[dev] ${line}`);
          
          if (!serverStarted) {
            const match = line.match(urlPattern);
            if (match) {
              const port = match[1] || match[2] || match[3];
              this.serverUrl = `http://localhost:${port}`;
              serverStarted = true;
              onLog(`[AutoCoder] Dev server ready at ${this.serverUrl}`);
              resolve({ success: true, url: this.serverUrl });
            }
          }
        });
      };

      this.currentProcess.stdout?.on('data', handleOutput);
      this.currentProcess.stderr?.on('data', handleOutput);

      this.currentProcess.on('error', (error) => {
        onLog(`[AutoCoder] Dev server error: ${error.message}`);
        if (!serverStarted) {
          resolve({ success: false, error: error.message });
        }
      });

      this.currentProcess.on('close', (code) => {
        if (!serverStarted) {
          onLog(`[AutoCoder] Dev server exited with code ${code}`);
          resolve({ success: false, error: `Server exited with code ${code}` });
        }
        this.currentProcess = null;
        this.serverUrl = null;
      });

      setTimeout(() => {
        if (!serverStarted && this.currentProcess) {
          this.serverUrl = `http://localhost:${this.serverPort}`;
          onLog(`[AutoCoder] Assuming server ready at ${this.serverUrl}`);
          serverStarted = true;
          resolve({ success: true, url: this.serverUrl });
        }
      }, 10000);
    });
  }

  async stopDevServer(): Promise<void> {
    if (this.currentProcess) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(this.currentProcess.pid), '/f', '/t']);
      } else {
        this.currentProcess.kill('SIGTERM');
      }
      this.currentProcess = null;
      this.serverUrl = null;
    }
  }

  isServerRunning(): boolean {
    return this.currentProcess !== null;
  }

  getServerUrl(): string | null {
    return this.serverUrl;
  }

  cleanup(): void {
    this.stopDevServer();
  }
}

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class ProjectManager {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(os.homedir(), 'AutoCoder', 'projects');
    this.ensureBaseDir();
  }

  private ensureBaseDir(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getProjectPath(projectName: string): string {
    const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    return path.join(this.baseDir, safeName);
  }

  async ensureProject(projectName: string): Promise<string> {
    const projectPath = this.getProjectPath(projectName);
    
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    
    return projectPath;
  }

  async listProjects(): Promise<string[]> {
    this.ensureBaseDir();
    
    try {
      const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort((a, b) => {
          const aPath = path.join(this.baseDir, a);
          const bPath = path.join(this.baseDir, b);
          const aStat = fs.statSync(aPath);
          const bStat = fs.statSync(bPath);
          return bStat.mtime.getTime() - aStat.mtime.getTime();
        });
    } catch {
      return [];
    }
  }

  async deleteProject(projectName: string): Promise<void> {
    const projectPath = this.getProjectPath(projectName);
    
    if (fs.existsSync(projectPath)) {
      fs.rmSync(projectPath, { recursive: true, force: true });
    }
  }

  async projectExists(projectName: string): Promise<boolean> {
    const projectPath = this.getProjectPath(projectName);
    return fs.existsSync(projectPath);
  }

  getBaseDir(): string {
    return this.baseDir;
  }
}

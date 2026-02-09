import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { app } from 'electron';
import { logger } from './logger.js';
import AdmZip from 'adm-zip';

const CACHE_READY_FILE = '.cache-unpacked';

export class NpmCacheManager {
  private cacheDir: string;
  private nodeModulesDir: string;
  private zipSourceDir: string;
  private isReady = false;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.cacheDir = path.join(userDataPath, 'npm-offline-cache');
    this.nodeModulesDir = path.join(this.cacheDir, 'node_modules');

    const resourcesPath = app.isPackaged
      ? path.join(process.resourcesPath, 'npm-cache')
      : path.join(path.dirname(app.getAppPath()), 'electron', 'npm-cache');
    this.zipSourceDir = resourcesPath;
  }

  get cachePath(): string {
    return this.nodeModulesDir;
  }

  get ready(): boolean {
    return this.isReady;
  }

  async initialize(): Promise<boolean> {
    try {
      logger.info('NpmCache', `Cache directory: ${this.cacheDir}`);
      logger.info('NpmCache', `Zip source directory: ${this.zipSourceDir}`);

      if (!fs.existsSync(this.zipSourceDir)) {
        logger.warn('NpmCache', `Zip source directory not found: ${this.zipSourceDir}`);
        return false;
      }

      const readyFile = path.join(this.cacheDir, CACHE_READY_FILE);
      if (fs.existsSync(readyFile) && fs.existsSync(this.nodeModulesDir)) {
        const manifest = this.readManifest();
        if (manifest) {
          logger.info('NpmCache', `Cache already unpacked: ${manifest.totalPackages} packages`);
          this.isReady = true;
          return true;
        }
      }

      logger.info('NpmCache', 'Unpacking offline npm cache (first run)...');
      return await this.unpackCache();
    } catch (err) {
      logger.error('NpmCache', `Failed to initialize cache: ${err}`);
      return false;
    }
  }

  private async unpackCache(): Promise<boolean> {
    try {
      if (fs.existsSync(this.cacheDir)) {
        fs.rmSync(this.cacheDir, { recursive: true });
      }
      fs.mkdirSync(this.cacheDir, { recursive: true });
      fs.mkdirSync(this.nodeModulesDir, { recursive: true });

      const zipFiles = fs.readdirSync(this.zipSourceDir)
        .filter(f => f.startsWith('cache-part-') && f.endsWith('.zip'))
        .sort();

      if (zipFiles.length === 0) {
        logger.warn('NpmCache', 'No cache zip files found');
        return false;
      }

      const manifest = this.readSourceManifest();
      const checksums: Record<string, string> = manifest?.chunkChecksums || {};

      logger.info('NpmCache', `Found ${zipFiles.length} cache chunks to unpack`);

      for (const zipFile of zipFiles) {
        const zipPath = path.join(this.zipSourceDir, zipFile);
        logger.info('NpmCache', `Unpacking ${zipFile}...`);

        if (checksums[zipFile]) {
          const actualHash = await this.computeFileHash(zipPath);
          if (actualHash !== checksums[zipFile]) {
            logger.error('NpmCache', `Integrity check failed for ${zipFile}: expected ${checksums[zipFile].slice(0, 16)}..., got ${actualHash.slice(0, 16)}...`);
            return false;
          }
          logger.info('NpmCache', `✓ ${zipFile} integrity verified`);
        }

        try {
          const zip = new AdmZip(zipPath);
          zip.extractAllTo(this.nodeModulesDir, true);
        } catch (err) {
          logger.error('NpmCache', `Failed to unpack ${zipFile}: ${err}`);
          return false;
        }
      }

      const manifestSrc = path.join(this.zipSourceDir, 'manifest.json');
      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, path.join(this.cacheDir, 'manifest.json'));
      }

      fs.writeFileSync(
        path.join(this.cacheDir, CACHE_READY_FILE),
        JSON.stringify({ unpackedAt: new Date().toISOString(), chunks: zipFiles.length })
      );

      const cachedManifest = this.readManifest();
      const pkgCount = cachedManifest?.totalPackages || 'unknown';
      logger.info('NpmCache', `Cache unpacked successfully: ${pkgCount} packages ready`);
      this.isReady = true;
      return true;
    } catch (err) {
      logger.error('NpmCache', `Cache unpack failed: ${err}`);
      return false;
    }
  }

  private readSourceManifest(): any {
    try {
      const manifestPath = path.join(this.zipSourceDir, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      }
    } catch {}
    return null;
  }

  private readManifest(): any {
    try {
      const manifestPath = path.join(this.cacheDir, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      }
    } catch {}
    return null;
  }

  hasPackage(packageName: string): boolean {
    if (!this.isReady) return false;
    const pkgDir = path.join(this.nodeModulesDir, packageName);
    return fs.existsSync(pkgDir) && fs.existsSync(path.join(pkgDir, 'package.json'));
  }

  getPackageVersion(packageName: string): string | null {
    if (!this.isReady) return null;
    try {
      const pkgJsonPath = path.join(this.nodeModulesDir, packageName, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8')).version;
      }
    } catch {}
    return null;
  }

  listCachedPackages(): string[] {
    if (!this.isReady) return [];
    const manifest = this.readManifest();
    if (manifest?.packages) {
      return Object.keys(manifest.packages);
    }
    return [];
  }

  getCacheStats(): { ready: boolean; packageCount: number; cachePath: string; sizeBytes: number } {
    const manifest = this.readManifest();
    let sizeBytes = 0;
    if (this.isReady && fs.existsSync(this.nodeModulesDir)) {
      try {
        sizeBytes = this.getDirSizeSync(this.nodeModulesDir);
      } catch {}
    }
    return {
      ready: this.isReady,
      packageCount: manifest?.totalPackages || 0,
      cachePath: this.nodeModulesDir,
      sizeBytes,
    };
  }

  private computeFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private getDirSizeSync(dirPath: string): number {
    let size = 0;
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          size += this.getDirSizeSync(fullPath);
        } else {
          size += fs.statSync(fullPath).size;
        }
      }
    } catch {}
    return size;
  }
}

export const npmCache = new NpmCacheManager();

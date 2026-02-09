import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.resolve(__dirname, '../npm-cache');
const TEMP_DIR = path.resolve(__dirname, '../../.npm-cache-temp');
const CHUNK_SIZE_MB = 75;
const CHUNK_SIZE_BYTES = CHUNK_SIZE_MB * 1024 * 1024;

const ALL_PACKAGES: Record<string, string> = {
  'react': '^18.3.1',
  'react-dom': '^18.3.1',
  'wouter': '^3.0.0',
  '@tanstack/react-query': '^5.0.0',
  '@tanstack/react-table': '^8.11.0',
  'lucide-react': '^0.344.0',
  'recharts': '^2.12.0',
  'date-fns': '^3.3.1',
  'clsx': '^2.1.0',
  'tailwind-merge': '^2.2.0',
  'zod': '^3.22.0',
  'framer-motion': '^11.0.0',
  'react-hook-form': '^7.50.0',
  '@hookform/resolvers': '^3.3.0',
  'drizzle-orm': '^0.29.0',
  'drizzle-zod': '^0.5.0',
  '@neondatabase/serverless': '^0.7.0',

  'zustand': '^4.5.0',
  'jotai': '^2.6.0',
  '@reduxjs/toolkit': '^2.1.0',
  'react-redux': '^9.1.0',

  'axios': '^1.6.0',
  'swr': '^2.2.0',
  'socket.io-client': '^4.7.0',

  'formik': '^2.4.0',
  'yup': '^1.3.0',

  '@react-spring/web': '^9.7.0',

  'lodash': '^4.17.21',
  'dayjs': '^1.11.10',
  'moment': '^2.30.0',
  'uuid': '^9.0.0',
  'nanoid': '^5.0.0',
  'classnames': '^2.5.0',
  'immer': '^10.0.0',

  'chart.js': '^4.4.0',
  'react-chartjs-2': '^5.2.0',
  'd3': '^7.8.0',

  'react-markdown': '^9.0.0',
  'remark-gfm': '^4.0.0',
  'react-syntax-highlighter': '^15.5.0',

  'react-hot-toast': '^2.4.0',
  'sonner': '^1.4.0',
  'react-toastify': '^10.0.0',

  'react-icons': '^5.0.0',

  'react-select': '^5.8.0',
  'react-datepicker': '^6.1.0',
  'react-dropzone': '^14.2.0',
  'react-dnd': '^16.0.0',
  'react-dnd-html5-backend': '^16.0.0',
  'react-beautiful-dnd': '^13.1.0',

  'cmdk': '^0.2.0',
  'vaul': '^0.9.0',
  'embla-carousel-react': '^8.0.0',
  'input-otp': '^1.2.0',
  'react-resizable-panels': '^2.0.0',

  '@radix-ui/react-dialog': '^1.0.0',
  '@radix-ui/react-dropdown-menu': '^2.0.0',
  '@radix-ui/react-tabs': '^1.0.0',
  '@radix-ui/react-tooltip': '^1.0.0',
  '@radix-ui/react-popover': '^1.0.0',
  '@radix-ui/react-select': '^2.0.0',
  '@radix-ui/react-checkbox': '^1.0.0',
  '@radix-ui/react-switch': '^1.0.0',
  '@radix-ui/react-slider': '^1.0.0',
  '@radix-ui/react-accordion': '^1.0.0',
  '@radix-ui/react-avatar': '^1.0.0',
  '@radix-ui/react-label': '^2.0.0',
  '@radix-ui/react-separator': '^1.0.0',
  '@radix-ui/react-scroll-area': '^1.0.0',
  '@radix-ui/react-toast': '^1.0.0',
  '@radix-ui/react-progress': '^1.0.0',
  '@radix-ui/react-alert-dialog': '^1.0.0',
  '@radix-ui/react-aspect-ratio': '^1.0.0',
  '@radix-ui/react-collapsible': '^1.0.0',
  '@radix-ui/react-context-menu': '^2.0.0',
  '@radix-ui/react-hover-card': '^1.0.0',
  '@radix-ui/react-menubar': '^1.0.0',
  '@radix-ui/react-navigation-menu': '^1.0.0',
  '@radix-ui/react-radio-group': '^1.0.0',
  '@radix-ui/react-toggle': '^1.0.0',
  '@radix-ui/react-toggle-group': '^1.0.0',

  'class-variance-authority': '^0.7.0',

  'express': '^4.18.0',
  'cors': '^2.8.0',
  'cookie-parser': '^1.4.0',
  'helmet': '^7.1.0',
  'morgan': '^1.10.0',
  'jsonwebtoken': '^9.0.0',
  'bcryptjs': '^2.4.0',
  'multer': '^1.4.0',
  'nodemailer': '^6.9.0',
  'ws': '^8.16.0',
};

const ALL_DEV_PACKAGES: Record<string, string> = {
  'vite': '^5.1.0',
  '@vitejs/plugin-react': '^4.2.0',
  'tailwindcss': '^3.4.1',
  'postcss': '^8.4.35',
  'autoprefixer': '^10.4.17',
  'fast-glob': '^3.3.2',
  'vitest': '^1.3.0',
  '@testing-library/react': '^14.2.0',
  '@testing-library/jest-dom': '^6.4.0',
  '@testing-library/user-event': '^14.5.0',
  'jsdom': '^24.0.0',
  'typescript': '^5.3.0',
  '@types/react': '^18.2.0',
  '@types/react-dom': '^18.2.0',
  '@types/node': '^20.11.0',
  '@types/lodash': '^4.14.0',
  '@types/uuid': '^9.0.0',
  '@types/d3': '^7.4.0',
  '@types/react-beautiful-dnd': '^13.1.0',
  '@types/react-syntax-highlighter': '^15.5.0',
  '@types/jsonwebtoken': '^9.0.0',
  '@types/bcryptjs': '^2.4.0',
  '@types/cors': '^2.8.0',
  '@types/cookie-parser': '^1.4.0',
  '@types/morgan': '^1.9.0',
  '@types/multer': '^1.4.0',
  '@types/nodemailer': '^6.4.0',
  '@types/ws': '^8.5.0',
  'eslint': '^8.56.0',
  'prettier': '^3.2.0',
  '@typescript-eslint/eslint-plugin': '^7.0.0',
  '@typescript-eslint/parser': '^7.0.0',
  'eslint-plugin-react-hooks': '^4.6.0',
};

async function main() {
  const totalPackages = Object.keys(ALL_PACKAGES).length + Object.keys(ALL_DEV_PACKAGES).length;
  console.log(`\n📦 AutoCoder Offline NPM Cache Builder`);
  console.log(`   ${Object.keys(ALL_PACKAGES).length} dependencies + ${Object.keys(ALL_DEV_PACKAGES).length} devDependencies = ${totalPackages} packages total\n`);

  if (fs.existsSync(TEMP_DIR)) {
    console.log('Cleaning up previous temp directory...');
    fs.rmSync(TEMP_DIR, { recursive: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const packageJson = {
    name: 'autocoder-npm-cache',
    version: '1.0.0',
    private: true,
    dependencies: ALL_PACKAGES,
    devDependencies: ALL_DEV_PACKAGES,
  };

  fs.writeFileSync(path.join(TEMP_DIR, 'package.json'), JSON.stringify(packageJson, null, 2));
  console.log('Written package.json with all packages');

  console.log('\n📥 Running npm install (this may take a few minutes)...\n');
  try {
    execSync('npm install --prefer-online --no-audit --no-fund --loglevel=warn', {
      cwd: TEMP_DIR,
      stdio: 'inherit',
      timeout: 600000,
    });
  } catch (err) {
    console.error('npm install failed:', err);
    process.exit(1);
  }

  const nodeModulesPath = path.join(TEMP_DIR, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.error('node_modules not found after install!');
    process.exit(1);
  }

  const installedSize = getDirSize(nodeModulesPath);
  console.log(`\n✅ Installed ${totalPackages} packages`);
  console.log(`   node_modules size: ${(installedSize / 1024 / 1024).toFixed(1)} MB`);

  console.log('\n📦 Creating manifest...');
  const manifest = createManifest(nodeModulesPath);
  fs.writeFileSync(
    path.join(CACHE_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\n🗜️  Splitting node_modules into ~${CHUNK_SIZE_MB}MB zip chunks...`);

  for (const f of fs.readdirSync(CACHE_DIR)) {
    if (f.startsWith('cache-part-') && f.endsWith('.zip')) {
      fs.unlinkSync(path.join(CACHE_DIR, f));
    }
  }

  const allFiles = getAllFiles(nodeModulesPath, nodeModulesPath);
  console.log(`   Found ${allFiles.length} files to archive`);

  let chunkIndex = 1;
  let currentSize = 0;
  let currentFiles: string[] = [];

  for (const file of allFiles) {
    const fullPath = path.join(nodeModulesPath, file);
    const stat = fs.statSync(fullPath);
    currentFiles.push(file);
    currentSize += stat.size;

    if (currentSize >= CHUNK_SIZE_BYTES) {
      await writeChunk(chunkIndex, currentFiles, nodeModulesPath);
      chunkIndex++;
      currentFiles = [];
      currentSize = 0;
    }
  }

  if (currentFiles.length > 0) {
    await writeChunk(chunkIndex, currentFiles, nodeModulesPath);
    chunkIndex++;
  }

  const totalChunks = chunkIndex - 1;
  let totalZipSize = 0;
  for (let i = 1; i <= totalChunks; i++) {
    const chunkPath = path.join(CACHE_DIR, `cache-part-${String(i).padStart(2, '0')}.zip`);
    if (fs.existsSync(chunkPath)) {
      totalZipSize += fs.statSync(chunkPath).size;
    }
  }

  console.log(`\n✅ Created ${totalChunks} zip chunks`);
  console.log(`   Total compressed size: ${(totalZipSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Location: ${CACHE_DIR}/`);

  console.log('\n🧹 Cleaning up temp directory...');
  fs.rmSync(TEMP_DIR, { recursive: true });

  console.log('\n✅ Done! Offline npm cache is ready.');
  console.log(`   ${totalChunks} chunks × ~${CHUNK_SIZE_MB}MB = ${(totalZipSize / 1024 / 1024).toFixed(1)} MB total`);
}

function getDirSize(dirPath: string): number {
  let size = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}

function getAllFiles(dir: string, root: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(root, fullPath);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, root));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

function createManifest(nodeModulesPath: string) {
  const packages: Record<string, { version: string; files: number }> = {};
  const entries = fs.readdirSync(nodeModulesPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    if (entry.name.startsWith('@')) {
      const scopeDir = path.join(nodeModulesPath, entry.name);
      const scopedEntries = fs.readdirSync(scopeDir, { withFileTypes: true });
      for (const scopedEntry of scopedEntries) {
        if (!scopedEntry.isDirectory()) continue;
        const pkgName = `${entry.name}/${scopedEntry.name}`;
        const pkgPath = path.join(scopeDir, scopedEntry.name);
        const pkgJson = readPkgVersion(pkgPath);
        packages[pkgName] = {
          version: pkgJson,
          files: countFiles(pkgPath),
        };
      }
    } else if (entry.name !== '.package-lock.json' && entry.name !== '.cache') {
      const pkgPath = path.join(nodeModulesPath, entry.name);
      const pkgJson = readPkgVersion(pkgPath);
      packages[entry.name] = {
        version: pkgJson,
        files: countFiles(pkgPath),
      };
    }
  }

  return {
    createdAt: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: execSync('npm --version').toString().trim(),
    totalPackages: Object.keys(packages).length,
    requestedPackages: Object.keys(ALL_PACKAGES).length + Object.keys(ALL_DEV_PACKAGES).length,
    packages,
  };
}

function readPkgVersion(pkgPath: string): string {
  try {
    const raw = fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf-8');
    return JSON.parse(raw).version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function countFiles(dir: string): number {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += countFiles(path.join(dir, entry.name));
      } else {
        count++;
      }
    }
  } catch {}
  return count;
}

async function writeChunk(index: number, files: string[], rootDir: string) {
  const chunkName = `cache-part-${String(index).padStart(2, '0')}.zip`;
  const chunkPath = path.join(CACHE_DIR, chunkName);

  const fileListPath = path.join(TEMP_DIR, `chunk-${index}.txt`);
  fs.writeFileSync(fileListPath, files.join('\n'));

  try {
    execSync(`cd "${rootDir}" && cat "${fileListPath}" | zip -@ "${chunkPath}" -q`, {
      timeout: 120000,
    });
    const size = fs.statSync(chunkPath).size;
    console.log(`   ✅ ${chunkName}: ${(size / 1024 / 1024).toFixed(1)} MB (${files.length} files)`);
  } catch (err) {
    console.error(`   ❌ Failed to create ${chunkName}:`, err);
  }
}

main().catch(console.error);

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

const PREWARM_DEPS: Record<string, string> = {
  'react': '^18.3.1', 'react-dom': '^18.3.1',
  'wouter': '^3.0.0', 'react-router-dom': '^6.20.0',
  '@tanstack/react-query': '^5.0.0', '@tanstack/react-table': '^8.11.0',
  '@tanstack/react-virtual': '^3.2.0',
  'lucide-react': '^0.344.0', 'react-icons': '^5.0.0',
  'clsx': '^2.1.0', 'tailwind-merge': '^2.2.0', 'class-variance-authority': '^0.7.0',
  'classnames': '^2.5.1',
  'zod': '^3.22.0', 'zod-to-json-schema': '^3.22.0',
  'react-hook-form': '^7.50.0', '@hookform/resolvers': '^3.3.0',
  'formik': '^2.4.5', 'yup': '^1.3.3',
  'framer-motion': '^11.0.0', '@react-spring/web': '^9.7.3',

  '@radix-ui/react-slot': '^1.0.2', '@radix-ui/react-dialog': '^1.0.5',
  '@radix-ui/react-select': '^2.0.0', '@radix-ui/react-label': '^2.0.2',
  '@radix-ui/react-tabs': '^1.0.4', '@radix-ui/react-tooltip': '^1.0.7',
  '@radix-ui/react-popover': '^1.0.7', '@radix-ui/react-dropdown-menu': '^2.0.6',
  '@radix-ui/react-checkbox': '^1.0.4', '@radix-ui/react-separator': '^1.0.3',
  '@radix-ui/react-scroll-area': '^1.0.5', '@radix-ui/react-switch': '^1.0.3',
  '@radix-ui/react-toast': '^1.1.5', '@radix-ui/react-icons': '^1.3.0',
  '@radix-ui/react-avatar': '^1.0.4', '@radix-ui/react-alert-dialog': '^1.0.5',
  '@radix-ui/react-accordion': '^1.1.2', '@radix-ui/react-progress': '^1.0.3',
  '@radix-ui/react-radio-group': '^1.1.3', '@radix-ui/react-slider': '^1.1.2',
  '@radix-ui/react-toggle': '^1.0.3', '@radix-ui/react-toggle-group': '^1.0.4',
  '@radix-ui/react-context-menu': '^2.1.5', '@radix-ui/react-menubar': '^1.0.4',
  '@radix-ui/react-collapsible': '^1.0.3', '@radix-ui/react-navigation-menu': '^1.1.4',
  '@radix-ui/react-hover-card': '^1.0.7', '@radix-ui/react-aspect-ratio': '^1.0.3',

  'embla-carousel-react': '^8.0.0', 'vaul': '^0.9.0', 'sonner': '^1.4.0',
  'input-otp': '^1.2.0', 'cmdk': '^0.2.0',
  'react-day-picker': '^8.10.0', 'date-fns': '^3.3.1',
  'nanoid': '^5.0.0', 'uuid': '^9.0.0',

  'express': '^4.18.2', 'cors': '^2.8.5', 'body-parser': '^1.20.0',
  'helmet': '^7.1.0', 'cookie-parser': '^1.4.6',
  'morgan': '^1.10.0', 'compression': '^1.7.4', 'dotenv': '^16.4.0',
  'drizzle-orm': '^0.29.0', 'drizzle-zod': '^0.5.0',
  'passport': '^0.7.0', 'passport-local': '^1.0.0', 'express-session': '^1.17.3',
  'bcryptjs': '^2.4.3', 'express-rate-limit': '^7.1.0',
  'express-validator': '^7.0.0', 'multer': '^1.4.5-lts.1',
  'http-errors': '^2.0.0', '@neondatabase/serverless': '^0.7.0',
  'pg': '^8.11.3', 'connect-pg-simple': '^9.0.0',
  'jose': '^5.2.0', 'jsonwebtoken': '^9.0.0',

  'recharts': '^2.12.0', 'chart.js': '^4.4.0', 'react-chartjs-2': '^5.2.0',
  'react-circular-progressbar': '^2.1.0', 'react-countup': '^6.5.0',
  'react-sparklines': '^1.7.0',

  '@dnd-kit/core': '^6.1.0', '@dnd-kit/sortable': '^8.0.0', '@dnd-kit/utilities': '^3.2.2',
  'react-beautiful-dnd': '^13.1.1',

  'axios': '^1.6.0', 'swr': '^2.2.0',
  'zustand': '^4.4.0', 'jotai': '^2.6.0', 'immer': '^10.0.3', 'xstate': '^5.5.0',

  'react-markdown': '^9.0.1', 'marked': '^12.0.0',
  'dompurify': '^3.0.8', 'sanitize-html': '^2.12.1',
  'highlight.js': '^11.9.0', 'prismjs': '^1.29.0',
  'react-syntax-highlighter': '^15.5.0',

  'slate': '^0.101.0', 'slate-react': '^0.101.0',
  '@tiptap/react': '^2.2.0', '@tiptap/starter-kit': '^2.2.0', '@tiptap/extension-placeholder': '^2.2.0',

  'react-select': '^5.8.0', 'react-color': '^2.19.3', 'react-color-palette': '^7.1.1',
  'react-number-format': '^5.3.1', 'react-textarea-autosize': '^8.5.3',
  'react-dropzone': '^14.2.3', 'react-signature-canvas': '^1.0.6',
  'react-datepicker': '^6.1.0',

  'react-virtuoso': '^4.7.0', 'react-window': '^1.8.10',
  'react-resizable-panels': '^2.0.0', 'react-grid-layout': '^1.4.4',
  'reactflow': '^11.11.0',

  'leaflet': '^1.9.4', 'react-leaflet': '^4.2.1',

  'react-player': '^2.14.1', 'react-webcam': '^7.2.0',
  'swiper': '^11.0.5', 'lottie-react': '^2.4.0',

  'html2canvas': '^1.4.1', 'html-to-image': '^1.11.11',
  'jspdf': '^2.5.1', 'pdfmake': '^0.2.10',
  'react-qr-code': '^2.0.12', 'qrcode': '^1.5.3',

  'exceljs': '^4.4.0', 'file-saver': '^2.0.5',
  'papaparse': '^5.4.1', 'csv-parse': '^5.5.3', 'csv-stringify': '^6.4.5',

  'jszip': '^3.10.1', 'superjson': '^2.2.1', 'qs': '^6.11.2',
  'currency.js': '^2.0.4', 'decimal.js': '^10.4.3',
  'dayjs': '^1.11.0', 'moment': '^2.29.0', 'lodash': '^4.17.21',
  'p-queue': '^8.0.1',
  'socket.io-client': '^4.7.0',

  'react-hot-toast': '^2.4.1',
  '@formkit/auto-animate': '^0.8.1',

  'react-big-calendar': '^1.8.7',
  'react-timer-hook': '^3.0.7',
  'konva': '^9.3.6',
  'cropperjs': '^1.6.1', 'react-cropper': '^2.3.3',
  'react-zoom-pan-pinch': '^3.4.2',

  'react-intersection-observer': '^9.8.1',
  'react-use': '^17.5.0', 'usehooks-ts': '^3.0.1',
  'react-error-boundary': '^4.0.12',
  'react-helmet-async': '^2.0.4',
  'react-i18next': '^14.0.5', 'i18next': '^23.10.0',
  'react-loading-skeleton': '^3.4.0',
  'react-confetti': '^6.1.0',
  'react-copy-to-clipboard': '^5.1.0',

  'boring-avatars': '^1.10.1', 'canvas-confetti': '^1.9.2',
  'cuid': '^3.0.0', 'fast-deep-equal': '^3.1.3',
  'fuse.js': '^7.0.0', 'mitt': '^3.0.1',
  'tiny-invariant': '^1.3.3', 'use-debounce': '^10.0.0',
  'validator': '^13.11.0', 'zxcvbn': '^4.4.2',
};

const PREWARM_DEV_DEPS: Record<string, string> = {
  'vite': '^5.1.0', '@vitejs/plugin-react': '^4.2.0',
  'typescript': '^5.3.0', 'esbuild': '^0.19.0',
  'tailwindcss': '3.4.17', 'postcss': '^8.4.35', 'autoprefixer': '^10.4.17',
  '@types/react': '^18.2.0', '@types/react-dom': '^18.2.0', '@types/node': '^20.10.0',
  '@types/uuid': '^9.0.7',
  '@types/express': '^4.17.21', '@types/cors': '^2.8.17',
  '@types/morgan': '^1.9.9', '@types/compression': '^1.7.5',
  'drizzle-kit': '^0.20.0', '@types/bcryptjs': '^2.4.6',
  '@types/lodash': '^4.14.202',
  'tsx': '^4.7.0',
  '@types/pg': '^8.10.9', '@types/passport': '^1.0.16',
  '@types/express-session': '^1.17.10', '@types/jsonwebtoken': '^9.0.5',
  '@types/react-beautiful-dnd': '^13.1.8', '@types/multer': '^1.4.11',
  '@types/react-color': '^3.0.12', '@types/react-window': '^1.8.8',
  '@types/dompurify': '^3.0.5', '@types/sanitize-html': '^2.11.0',
  '@types/papaparse': '^5.3.14', '@types/prismjs': '^1.26.3',
  '@types/react-signature-canvas': '^1.0.5',
  '@types/react-copy-to-clipboard': '^5.0.7',
  '@types/react-syntax-highlighter': '^15.5.11',
  '@types/leaflet': '^1.9.8',
  '@types/react-grid-layout': '^1.3.5',
  '@types/react-big-calendar': '^1.8.4',
  '@types/react-datepicker': '^6.0.1',
  '@types/react-sparklines': '^1.7.5',
  '@types/validator': '^13.11.8', '@types/zxcvbn': '^4.4.4',
  '@types/file-saver': '^2.0.7', '@types/cookie-parser': '^1.4.6',
  '@types/passport-local': '^1.0.38', '@types/connect-pg-simple': '^7.0.3',
  '@types/qs': '^6.9.11', '@types/http-errors': '^2.0.4',
  'vitest': '^1.3.0',
  '@testing-library/react': '^14.2.0',
  '@testing-library/jest-dom': '^6.4.0',
  '@testing-library/user-event': '^14.5.0',
  'jsdom': '^24.0.0',
  'picomatch': '^4.0.2', 'fast-glob': '^3.3.2',
};

const SKIP_EXTENSIONS = new Set([
  '.map', '.ts.map', '.js.map',
  '.md', '.markdown',
  '.txt', '.log',
  '.yml', '.yaml',
  '.lock',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.bmp', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.doc', '.docx',
  '.mp3', '.mp4', '.wav', '.avi',
  '.zip', '.tar', '.gz', '.tgz', '.bz2',
  '.exe', '.dll', '.so', '.dylib', '.node',
]);

const SKIP_DIRS = new Set([
  '.cache', '.github', '.vscode', 'test', 'tests', '__tests__',
  'docs', 'doc', 'example', 'examples', 'benchmark', 'benchmarks',
  'coverage', '.nyc_output', 'fixtures', '__fixtures__',
  'demo', 'demos', 'website', 'scripts',
]);

const SKIP_FILES = new Set([
  'CHANGELOG.md', 'CHANGELOG', 'CHANGES.md', 'HISTORY.md',
  'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md',
  '.npmignore', '.gitignore', '.eslintrc', '.eslintrc.js', '.eslintrc.json',
  '.prettierrc', '.prettierrc.js', '.prettierrc.json',
  '.babelrc', '.babelrc.js', 'babel.config.js', 'babel.config.json',
  'jest.config.js', 'jest.config.ts', 'jest.config.json',
  'tsconfig.build.json', 'tsconfig.test.json',
  'webpack.config.js', 'rollup.config.js', 'rollup.config.mjs',
  '.editorconfig', '.travis.yml', 'appveyor.yml',
  'Makefile', 'Gruntfile.js', 'Gulpfile.js',
]);

interface FileSystemTree {
  [key: string]: { file: { contents: string } } | { directory: FileSystemTree };
}

function shouldSkipFile(filename: string): boolean {
  if (SKIP_FILES.has(filename)) return true;
  const ext = path.extname(filename).toLowerCase();
  if (SKIP_EXTENSIONS.has(ext)) return true;
  if (filename.startsWith('.') && filename !== '.package.json') return true;
  return false;
}

function shouldSkipDir(dirname: string): boolean {
  if (SKIP_DIRS.has(dirname)) return true;
  if (dirname.startsWith('.') && dirname !== '.bin') return true;
  return false;
}

function walkDir(dirPath: string, depth: number = 0): FileSystemTree | null {
  const tree: FileSystemTree = {};
  let entries: string[];
  try {
    entries = fs.readdirSync(dirPath);
  } catch {
    return null;
  }

  let hasContent = false;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    let stat: fs.Stats;
    try {
      stat = fs.lstatSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isSymbolicLink()) {
      try {
        const realPath = fs.realpathSync(fullPath);
        stat = fs.statSync(realPath);
      } catch {
        continue;
      }
    }

    if (stat.isDirectory()) {
      if (depth > 0 && shouldSkipDir(entry)) continue;
      const subTree = walkDir(fullPath, depth + 1);
      if (subTree && Object.keys(subTree).length > 0) {
        tree[entry] = { directory: subTree };
        hasContent = true;
      }
    } else if (stat.isFile()) {
      if (depth > 1 && shouldSkipFile(entry)) continue;
      if (stat.size > 500_000) continue;

      try {
        const contents = fs.readFileSync(fullPath, 'utf-8');
        tree[entry] = { file: { contents } };
        hasContent = true;
      } catch {
        continue;
      }
    }
  }

  return hasContent ? tree : null;
}

async function main() {
  const tmpDir = path.join(process.cwd(), '.prewarm-tmp');

  console.log('=== Pre-warm Snapshot Generator ===');
  console.log(`Total deps: ${Object.keys(PREWARM_DEPS).length}`);
  console.log(`Total devDeps: ${Object.keys(PREWARM_DEV_DEPS).length}`);

  if (fs.existsSync(tmpDir)) {
    console.log('Cleaning previous temp directory...');
    fs.rmSync(tmpDir, { recursive: true });
  }
  fs.mkdirSync(tmpDir, { recursive: true });

  const pkgJson = {
    name: 'prewarm-cache',
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: { dev: 'vite' },
    dependencies: PREWARM_DEPS,
    devDependencies: PREWARM_DEV_DEPS,
  };

  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  console.log('\nInstalling packages (this will take a few minutes)...');
  try {
    execSync('npm install --prefer-offline --no-audit --no-fund --omit=optional --legacy-peer-deps --ignore-scripts', {
      cwd: tmpDir,
      stdio: 'inherit',
      timeout: 600_000,
    });
  } catch (err) {
    console.error('npm install failed:', err);
    process.exit(1);
  }

  const nodeModulesPath = path.join(tmpDir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.error('node_modules not found after install');
    process.exit(1);
  }

  console.log('\nScanning node_modules and building snapshot...');
  const snapshot = walkDir(nodeModulesPath, 0);

  if (!snapshot) {
    console.error('Empty snapshot - something went wrong');
    process.exit(1);
  }

  const pkgJsonForSnapshot = JSON.stringify(pkgJson, null, 2);
  const fullTree: FileSystemTree = {
    'package.json': { file: { contents: pkgJsonForSnapshot } },
    'node_modules': { directory: snapshot },
  };

  const jsonStr = JSON.stringify(fullTree);
  console.log(`\nSnapshot JSON size: ${(jsonStr.length / 1024 / 1024).toFixed(1)} MB`);

  const compressed = zlib.gzipSync(Buffer.from(jsonStr), { level: 9 });
  console.log(`Compressed size: ${(compressed.length / 1024 / 1024).toFixed(1)} MB`);

  const outputDir = path.join(process.cwd(), 'public', 'cache');
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'prewarm-snapshot.json.gz');
  fs.writeFileSync(outputPath, compressed);
  console.log(`\nSnapshot saved to: ${outputPath}`);

  const fileCount = countEntries(fullTree);
  console.log(`Total files in snapshot: ${fileCount}`);

  const metaPath = path.join(outputDir, 'prewarm-meta.json');
  const meta = {
    generatedAt: new Date().toISOString(),
    depsCount: Object.keys(PREWARM_DEPS).length,
    devDepsCount: Object.keys(PREWARM_DEV_DEPS).length,
    fileCount,
    compressedSizeBytes: compressed.length,
    uncompressedSizeBytes: jsonStr.length,
  };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`Metadata saved to: ${metaPath}`);

  console.log('\nCleaning up temp directory...');
  fs.rmSync(tmpDir, { recursive: true });

  console.log('\n=== Done! ===');
  console.log('The snapshot will be served at /cache/prewarm-snapshot.json.gz');
  console.log('WebContainer will load it on startup instead of running npm install.');
}

function countEntries(tree: FileSystemTree): number {
  let count = 0;
  for (const key of Object.keys(tree)) {
    const entry = tree[key];
    if ('file' in entry) {
      count++;
    } else if ('directory' in entry) {
      count += countEntries(entry.directory);
    }
  }
  return count;
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

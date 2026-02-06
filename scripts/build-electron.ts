import * as esbuild from 'esbuild';

async function buildElectron() {
  console.log('Building Electron main process...');
  
  await esbuild.build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist-electron/main.js',
    external: ['electron'],
    sourcemap: true,
    banner: {
      js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
    },
  });

  console.log('Building Electron preload script...');
  
  await esbuild.build({
    entryPoints: ['electron/preload.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: 'dist-electron/preload.js',
    external: ['electron'],
    sourcemap: true,
  });

  console.log('Electron build complete! Output in dist-electron/');
}

buildElectron().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});

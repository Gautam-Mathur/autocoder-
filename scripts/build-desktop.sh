#!/bin/bash

echo "[AutoCoder] Building React app..."
npm run build

echo "[AutoCoder] Cleaning dist-electron..."
rm -rf dist-electron

echo "[AutoCoder] Building Electron main process (ESNext)..."
npx tsc -p electron/tsconfig.json

echo "[AutoCoder] Building Electron preload script (CommonJS)..."
npx tsc -p electron/tsconfig.preload.json

echo "[AutoCoder] Packaging desktop app..."
npx electron-builder --config electron-builder.json

echo "[AutoCoder] Desktop app built! Check the 'release' folder."

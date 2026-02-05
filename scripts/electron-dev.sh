#!/bin/bash

echo "[AutoCoder] Cleaning dist-electron..."
rm -rf dist-electron

echo "[AutoCoder] Building Electron main process (ESNext)..."
npx tsc -p electron/tsconfig.json

echo "[AutoCoder] Building Electron preload script (CommonJS)..."
npx tsc -p electron/tsconfig.preload.json

echo "[AutoCoder] Starting Electron in development mode..."
NODE_ENV=development npx electron dist-electron/main.js

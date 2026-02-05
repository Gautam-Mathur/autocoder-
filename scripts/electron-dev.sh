#!/bin/bash

echo "[AutoCoder] Building Electron..."
npx tsc -p electron/tsconfig.json

echo "[AutoCoder] Starting Electron in development mode..."
NODE_ENV=development npx electron dist-electron/main.js

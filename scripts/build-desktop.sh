#!/bin/bash

echo "[AutoCoder] Building React app..."
npm run build

echo "[AutoCoder] Building Electron..."
npx tsc -p electron/tsconfig.json

echo "[AutoCoder] Packaging desktop app..."
npx electron-builder --config electron-builder.json

echo "[AutoCoder] Desktop app built! Check the 'release' folder."

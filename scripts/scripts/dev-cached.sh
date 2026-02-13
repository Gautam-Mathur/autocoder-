#!/bin/bash
# Optimized dev server with build caching
# Only watches server/ and shared/ for restarts - client changes use Vite HMR
# This prevents full page refreshes when editing frontend files

export NODE_ENV=development

# Ensure Vite dep cache persists
export VITE_CJS_IGNORE_WARNING=true

exec npx tsx watch \
  --clear-screen=false \
  --watch-path=server \
  --watch-path=shared \
  server/index.ts

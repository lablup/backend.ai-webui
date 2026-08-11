#!/usr/bin/env bash
# Scan every dark-capable harness page for light surfaces (dark mode).
set -u
cd "$(dirname "$0")/../../../.." || exit 1
for p in "$@"; do
  echo "===== $p ====="
  node .scratch/astryx-migration/shots/fix-dark/scan-light-surfaces.mjs \
    "http://127.0.0.1:5795/theme-probe/$p.html" 2>&1 |
    python3 .scratch/astryx-migration/shots/fix-dark/fmt-scan.py
done

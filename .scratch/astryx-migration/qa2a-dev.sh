#!/usr/bin/env bash
# QA2-A dev server (port 5910). Kept out of the way of the other QA agents.
set -euo pipefail
cd "$(dirname "$0")/../../react"
exec pnpm exec vite --port 5910 --strictPort --host 127.0.0.1

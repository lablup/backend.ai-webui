#!/bin/bash
# Rewrites this package's version to a canary (`<base>-canary-<sha>-<date>`).
# Unlike backend.ai-ui's script, the base comes from THIS package.json: the CLI
# is versioned on its own (0.x), not on the WebUI release train.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PACKAGE_JSON="${PACKAGE_DIR}/package.json"

COMMIT_HASH=$(git rev-parse --short=9 HEAD)
BUILD_DATE=$(date +%Y%m%d)

BASE_VERSION_FULL=$(node -p "require('${PACKAGE_JSON}').version")
# Only the release part (0.1.0-rc.1 -> 0.1.0); the canary carries its own suffix.
BASE_VERSION="${BASE_VERSION_FULL%%-*}"

CANARY_VERSION="${BASE_VERSION}-canary-${COMMIT_HASH}-${BUILD_DATE}"

echo "Updating version to ${CANARY_VERSION}"
echo "  Base version: ${BASE_VERSION}"
echo "  Commit hash: ${COMMIT_HASH}"
echo "  Build date: ${BUILD_DATE}"

node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('${PACKAGE_JSON}', 'utf8'));
  pkg.version = '${CANARY_VERSION}';
  fs.writeFileSync('${PACKAGE_JSON}', JSON.stringify(pkg, null, 2) + '\n');
"

echo "Updated package.json version to ${CANARY_VERSION}"

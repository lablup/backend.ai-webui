#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOT_DIR="$(cd "${PACKAGE_DIR}/../.." && pwd)"
PACKAGE_JSON="${PACKAGE_DIR}/package.json"
ROOT_PACKAGE_JSON="${ROOT_DIR}/package.json"

# Get commit hash and build date
COMMIT_HASH=$(git rev-parse --short=9 HEAD)
BUILD_DATE=$(date +%Y%m%d)

# Read the base version from root package.json
BASE_VERSION_FULL=$(node -p "require('${ROOT_PACKAGE_JSON}').version")
# Extract only the version part before the first '-' (e.g., 25.16.0-alpha.0 -> 25.16.0)
BASE_VERSION="${BASE_VERSION_FULL%%-*}"

# Create canary version (React style: version-canary-hash-date)
CANARY_VERSION="${BASE_VERSION}-canary-${COMMIT_HASH}-${BUILD_DATE}"

echo "Updating version to ${CANARY_VERSION}"
echo "  Base version: ${BASE_VERSION}"
echo "  Commit hash: ${COMMIT_HASH}"
echo "  Build date: ${BUILD_DATE}"

# Update package.json version
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('${PACKAGE_JSON}', 'utf8'));
  pkg.version = '${CANARY_VERSION}';
  fs.writeFileSync('${PACKAGE_JSON}', JSON.stringify(pkg, null, 2) + '\n');
"

echo "Updated package.json version to ${CANARY_VERSION}"

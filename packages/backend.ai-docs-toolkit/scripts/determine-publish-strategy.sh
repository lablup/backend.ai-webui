#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PACKAGE_JSON="${PACKAGE_DIR}/package.json"

# Get git tag from argument (expects version without 'v' prefix, e.g., 25.17.2)
GIT_TAG="$1"

if [ -z "$GIT_TAG" ]; then
  echo "Error: No git tag provided" >&2
  echo "Usage: $0 <version>" >&2
  echo "Example: $0 25.17.2-rc.0" >&2
  exit 1
fi

echo "Analyzing version: ${GIT_TAG}" >&2

PACKAGE_NAME=$(node -p "require('${PACKAGE_JSON}').name")

# Determine npm tag based on version suffix
if [[ "$GIT_TAG" == *"-alpha"* ]]; then
  echo "⏭️  Alpha version detected. Skipping npm publish." >&2
  echo "should_publish=false"
  echo "npm_tag="
  exit 0
elif [[ "$GIT_TAG" == *"-rc"* ]]; then
  echo "✅ RC version detected. Publishing to rc tag without version check." >&2
  echo "should_publish=true"
  echo "npm_tag=rc"
  exit 0
elif [[ "$GIT_TAG" == *"-beta"* ]]; then
  echo "✅ Beta version detected. Publishing to beta tag without version check." >&2
  echo "should_publish=true"
  echo "npm_tag=beta"
  exit 0
else
  NPM_TAG="latest"
fi

echo "  Determined npm tag: ${NPM_TAG}" >&2

# Get the latest published version for the latest tag
LATEST_VERSION=$(npm view "${PACKAGE_NAME}@${NPM_TAG}" version 2>/dev/null || echo "0.0.0")

echo "  Current version: ${GIT_TAG}" >&2
echo "  Latest published ${NPM_TAG} version: ${LATEST_VERSION}" >&2

# Function to extract base version (major.minor.patch) from semver string
extract_base_version() {
  local version="$1"
  # Extract major.minor.patch, ignoring prerelease tags
  echo "$version" | sed -E 's/^([0-9]+\.[0-9]+\.[0-9]+).*/\1/'
}

# Function to compare two semver versions (major.minor.patch only)
# Returns: 0 if v1 > v2, 1 if v1 == v2, 2 if v1 < v2
compare_versions() {
  local v1="$1"
  local v2="$2"

  # Split versions into components
  IFS='.' read -r -a v1_parts <<< "$v1"
  IFS='.' read -r -a v2_parts <<< "$v2"

  # Compare major, minor, patch
  for i in 0 1 2; do
    local part1="${v1_parts[$i]:-0}"
    local part2="${v2_parts[$i]:-0}"

    if (( part1 > part2 )); then
      return 0  # v1 > v2
    elif (( part1 < part2 )); then
      return 2  # v1 < v2
    fi
  done

  return 1  # v1 == v2
}

# Extract base versions for comparison
CURRENT_BASE=$(extract_base_version "$GIT_TAG")
LATEST_BASE=$(extract_base_version "$LATEST_VERSION")

echo "  Comparing base versions: ${CURRENT_BASE} vs ${LATEST_BASE}" >&2

# Compare versions (temporarily disable exit on error for return codes)
set +e
compare_versions "$CURRENT_BASE" "$LATEST_BASE"
COMPARISON=$?
set -e

# Output results to stdout (GitHub Actions will capture this)
case "$COMPARISON" in
  0)  # Current > Latest
    echo "✅ Version ${GIT_TAG} is publishable (> ${LATEST_VERSION})" >&2
    echo "should_publish=true"
    echo "npm_tag=${NPM_TAG}"
    exit 0
    ;;
  1)  # Current == Latest
    echo "⏭️  Skipping publish: version ${GIT_TAG} is already published as ${LATEST_VERSION}" >&2
    echo "should_publish=false"
    echo "npm_tag="
    exit 0
    ;;
  2)  # Current < Latest
    echo "⏭️  Skipping publish: version ${GIT_TAG} is lower than latest ${LATEST_VERSION}" >&2
    echo "should_publish=false"
    echo "npm_tag="
    exit 0
    ;;
  *)
    echo "Error: Unexpected comparison result" >&2
    exit 1
    ;;
esac

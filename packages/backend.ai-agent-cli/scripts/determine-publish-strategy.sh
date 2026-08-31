#!/bin/bash
# Given the version from an `agent-cli-v<version>` tag, decides whether and
# under which npm dist-tag to publish. Prints `should_publish=` / `npm_tag=`
# lines for GITHUB_OUTPUT; everything else goes to stderr.
#
# The tag must equal package.json's version: the CLI is versioned by hand in
# the package (0.x), and a tag that disagrees with it is a mistake, not a
# request to publish something else.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PACKAGE_JSON="${PACKAGE_DIR}/package.json"

TAG_VERSION="$1"
if [ -z "$TAG_VERSION" ]; then
  echo "Usage: $0 <version>   (e.g. 0.1.0 or 0.2.0-rc.1)" >&2
  exit 1
fi

PACKAGE_NAME=$(node -p "require('${PACKAGE_JSON}').name")
PACKAGE_VERSION=$(node -p "require('${PACKAGE_JSON}').version")

if [ "$TAG_VERSION" != "$PACKAGE_VERSION" ]; then
  echo "Error: tag version ${TAG_VERSION} does not match ${PACKAGE_JSON} (${PACKAGE_VERSION})." >&2
  echo "Bump the package version in a PR first, then tag agent-cli-v${PACKAGE_VERSION}." >&2
  exit 1
fi

case "$TAG_VERSION" in
  *-rc*)    NPM_TAG="rc" ;;
  *-beta*)  NPM_TAG="beta" ;;
  *-alpha*)
    echo "Alpha version detected; skipping npm publish." >&2
    echo "should_publish=false"
    echo "npm_tag="
    exit 0
    ;;
  *)        NPM_TAG="latest" ;;
esac

# npm refuses to republish a version; make that a skip, not a red workflow.
if npm view "${PACKAGE_NAME}@${TAG_VERSION}" version >/dev/null 2>&1; then
  echo "Skipping publish: ${PACKAGE_NAME}@${TAG_VERSION} is already on npm." >&2
  echo "should_publish=false"
  echo "npm_tag="
  exit 0
fi

echo "Publishing ${PACKAGE_NAME}@${TAG_VERSION} under dist-tag ${NPM_TAG}." >&2
echo "should_publish=true"
echo "npm_tag=${NPM_TAG}"

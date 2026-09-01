#!/bin/bash

set -e

# Check if version argument is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 25.7.1"
    echo "Example: $0 v25.7.1"
    exit 1
fi

VERSION="$1"

# Remove 'v' prefix if present
VERSION="${VERSION#v}"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "${SCRIPT_DIR}")"

# Create temp directory structure
TEMP_BASE="${SCRIPT_DIR}/temp-releases"
mkdir -p "${TEMP_BASE}"

# Construct the download URL and filename
FILENAME="backend.ai-webui-bundle-${VERSION}.zip"
URL="https://github.com/lablup/backend.ai-webui/releases/download/v${VERSION}/${FILENAME}"

# Set paths in temp directory
DOWNLOAD_PATH="${TEMP_BASE}/${FILENAME}"
TEMP_DIR="${TEMP_BASE}/webui-${VERSION}"

# Check if the version folder already exists
if [ -d "${TEMP_DIR}" ]; then
    echo "Found existing ${TEMP_DIR}, skipping download and extraction..."
    # Find the extracted folder (it might be nested)
    EXTRACTED_FOLDER=$(find "${TEMP_DIR}" -type d -name "*webui*" | head -1)
    if [ -z "${EXTRACTED_FOLDER}" ]; then
        # If no webui folder found, use the temp directory itself
        EXTRACTED_FOLDER="${TEMP_DIR}"
    fi
else
    echo "Downloading ${FILENAME} to ${TEMP_BASE}..."
    curl -L -o "${DOWNLOAD_PATH}" "${URL}"

    if [ ! -f "${DOWNLOAD_PATH}" ]; then
        echo "Error: Failed to download ${FILENAME}"
        exit 1
    fi

    echo "Extracting ${FILENAME}..."
    rm -rf "${TEMP_DIR}"
    unzip -q "${DOWNLOAD_PATH}" -d "${TEMP_DIR}"

    # Find the extracted folder (it might be nested)
    EXTRACTED_FOLDER=$(find "${TEMP_DIR}" -type d -name "*webui*" | head -1)
    if [ -z "${EXTRACTED_FOLDER}" ]; then
        # If no webui folder found, use the temp directory itself
        EXTRACTED_FOLDER="${TEMP_DIR}"
    fi

    # Optionally remove the zip file after extraction to save space
    echo "Removing downloaded zip file..."
    rm "${DOWNLOAD_PATH}"
fi

echo "Overwriting config.toml to extracted folder..."
cp "${PROJECT_ROOT}/config.toml" "${EXTRACTED_FOLDER}/"
if [ -d "${PROJECT_ROOT}/dist/plugins" ]; then
    echo "Copying plugins to extracted folder..."
    mkdir -p "${EXTRACTED_FOLDER}/dist/"
    cp -r "${PROJECT_ROOT}/dist/plugins" "${EXTRACTED_FOLDER}/dist/"
fi

echo "Starting server in ${EXTRACTED_FOLDER}..."
cd "${EXTRACTED_FOLDER}"

# Check if serve is available, if not suggest installation
if ! command -v serve &> /dev/null; then
    echo "Error: 'serve' command not found."
    echo "Please install it with: npm install -g serve"
    exit 1
fi

# Pick the HTTP port `serve` will listen on. Honour SERVE_PORT if the caller
# pinned one, otherwise default to the legacy 9091.
SERVE_PORT="${SERVE_PORT:-9091}"

# Derive a Portless-safe app slug from the version so the URL reflects the
# released version (e.g. `26.4.8-rc.3` -> `v26-4-8-rc-3`). Portless cert
# generation does not like dots / very long subdomains, so collapse anything
# outside `[a-z0-9-]`, dedupe dashes, trim, and cap at 40 chars. We prefix `v`
# so the subdomain doesn't start with a digit (some DNS-style validators
# reject leading digits in labels even though browsers accept them).
APP_NAME=$(echo "v${VERSION}" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9-]+/-/g; s/-+/-/g; s/^-+//; s/-+$//' \
    | cut -c1-40)

# If portless isn't installed, fall back to plain `serve` on the chosen port.
if ! command -v portless &> /dev/null; then
    echo "Portless not found — serving directly on http://localhost:${SERVE_PORT}"
    echo "Press Ctrl+C to stop the server"
    serve -s -l "${SERVE_PORT}" .
    exit $?
fi

# Ensure the Portless daemon is running on the project's standard port (1355).
# `portless proxy start` is idempotent (no-op if already running on the same
# port). We honour PORTLESS_PORT when set so Portless reads it directly, matching
# `scripts/dev.mjs` conventions. We do NOT swallow every failure with `|| true`
# — that would hide real problems (port held by another process, permission
# error, broken binary) behind the URL announcement below and surface only as a
# confusing failure inside `exec portless ...`. Instead we log a warning and
# continue, so the user sees the root cause while the script still attempts the
# normal start path (which is harmless when the daemon is genuinely up).
PORTLESS_DAEMON_PORT="${PORTLESS_PORT:-1355}"
if [ -n "${PORTLESS_PORT:-}" ]; then
    portless proxy start \
        || echo "Warning: 'portless proxy start' returned non-zero. Continuing under the assumption the daemon is already running on PORTLESS_PORT=${PORTLESS_PORT}." >&2
else
    portless proxy start -p "${PORTLESS_DAEMON_PORT}" \
        || echo "Warning: 'portless proxy start -p ${PORTLESS_DAEMON_PORT}' returned non-zero. Continuing under the assumption the daemon is already running on ${PORTLESS_DAEMON_PORT}." >&2
fi

echo ""
echo "Serving v${VERSION} via Portless:"
echo "  https://${APP_NAME}.localhost:${PORTLESS_DAEMON_PORT}"
echo "  (direct: http://localhost:${SERVE_PORT})"
echo "Press Ctrl+C to stop the server"
echo ""

# `portless <name> <cmd>` routes traffic from the named subdomain to <cmd>.
# Pin --app-port so portless knows exactly where `serve` listens; this also
# avoids portless picking a random port and confusing the "direct" fallback URL.
exec portless "${APP_NAME}" --force --app-port "${SERVE_PORT}" -- \
    serve -s -l "${SERVE_PORT}" .
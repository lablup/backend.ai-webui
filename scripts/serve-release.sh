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

# Construct the download URL and filename
FILENAME="backend.ai-webui-bundle-${VERSION}.zip"
URL="https://github.com/lablup/backend.ai-webui/releases/download/v${VERSION}/${FILENAME}"

# Create a temporary directory for extraction
TEMP_DIR="temp-webui-${VERSION}"

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
    echo "Downloading ${FILENAME}..."
    curl -L -o "${FILENAME}" "${URL}"

    if [ ! -f "${FILENAME}" ]; then
        echo "Error: Failed to download ${FILENAME}"
        exit 1
    fi

    echo "Extracting ${FILENAME}..."
    rm -rf "${TEMP_DIR}"
    unzip -q "${FILENAME}" -d "${TEMP_DIR}"

    # Find the extracted folder (it might be nested)
    EXTRACTED_FOLDER=$(find "${TEMP_DIR}" -type d -name "*webui*" | head -1)
    if [ -z "${EXTRACTED_FOLDER}" ]; then
        # If no webui folder found, use the temp directory itself
        EXTRACTED_FOLDER="${TEMP_DIR}"
    fi
fi

echo "Copying config.toml to extracted folder..."
cp config.toml "${EXTRACTED_FOLDER}/"

echo "Starting server in ${EXTRACTED_FOLDER}..."
cd "${EXTRACTED_FOLDER}"

# Check if serve is available, if not suggest installation
if ! command -v serve &> /dev/null; then
    echo "Error: 'serve' command not found."
    echo "Please install it with: npm install -g serve"
    exit 1
fi

echo "Server starting"
echo "Press Ctrl+C to stop the server"
serve -s -l 9091 .
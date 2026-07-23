#!/bin/bash
#
# Update CHANGELOG.md with missing releases from GitHub
#
# This script fetches all stable releases (excluding pre-releases like rc, beta, alpha)
# from GitHub and updates CHANGELOG.md with proper markdown formatting.
#
# Usage:
#   ./scripts/update-changelog.sh
#
# Requirements:
#   - gh (GitHub CLI) must be installed and authenticated
#   - python3 must be available
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CHANGELOG_FILE="$PROJECT_ROOT/CHANGELOG.md"
TEMP_DIR="/tmp/changelog-update-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI (gh) is not installed"
        log_error "Install it from: https://cli.github.com/"
        exit 1
    fi

    if ! command -v python3 &> /dev/null; then
        log_error "python3 is not installed"
        exit 1
    fi

    # Check gh authentication
    if ! gh auth status &> /dev/null; then
        log_error "GitHub CLI is not authenticated"
        log_error "Run: gh auth login"
        exit 1
    fi

    log_info "All prerequisites met"
}

# Get the latest version from CHANGELOG.md
get_latest_changelog_version() {
    if [ ! -f "$CHANGELOG_FILE" ]; then
        echo ""
        return
    fi

    # Extract first version number from CHANGELOG.md
    grep -m 1 "^## v" "$CHANGELOG_FILE" | sed 's/^## \(v[0-9.]*\).*/\1/' || echo ""
}

# Fetch releases from GitHub
fetch_releases() {
    local latest_version="$1"
    local releases_file="$TEMP_DIR/releases.txt"

    log_info "Fetching releases from GitHub..."
    log_info "Latest version in CHANGELOG: ${latest_version:-none}"

    mkdir -p "$TEMP_DIR"

    # Fetch releases
    gh release list --repo lablup/backend.ai-webui --limit 100 --exclude-pre-releases | \
    awk '{print $1}' | \
    while read version; do
        # Stop when we reach the latest version in CHANGELOG
        if [ -n "$latest_version" ] && [ "$version" = "$latest_version" ]; then
            log_info "Reached existing version: $version"
            break
        fi

        echo "Processing $version..." >&2
        echo "=== $version ==="
        gh release view "$version" --repo lablup/backend.ai-webui --json publishedAt,body
        echo ""
    done > "$releases_file"

    local release_count=$(grep -c "^=== v" "$releases_file" || true)
    log_info "Fetched $release_count new releases"

    echo "$releases_file"
}

# Generate Python script to update CHANGELOG
generate_python_script() {
    local releases_file="$1"
    local python_script="$TEMP_DIR/update_changelog.py"

    cat > "$python_script" << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
import json
import re
import sys
from datetime import datetime
from pathlib import Path

def parse_releases(releases_file):
    """Parse releases from the text file."""
    with open(releases_file, 'r') as f:
        content = f.read()

    releases = []
    current_version = None
    current_data = {}

    for line in content.split('\n'):
        if line.startswith('=== v'):
            if current_version and current_data:
                releases.append((current_version, current_data))
            current_version = line.replace('===', '').strip()
            current_data = {}
        elif line.strip().startswith('{"body":'):
            try:
                data = json.loads(line.strip())
                current_data = data
            except:
                pass

    # Add last release
    if current_version and current_data:
        releases.append((current_version, current_data))

    return releases

def format_changelog_entry(version, data):
    """Format a single changelog entry."""
    if not data.get('body') or not data.get('publishedAt'):
        return None

    # Parse date
    pub_date = datetime.fromisoformat(data['publishedAt'].replace('Z', '+00:00'))
    date_str = pub_date.strftime('%d/%m/%Y')

    # Get body and fix header levels
    body = data['body'].replace('\\r\\n', '\n').replace('\\n', '\n')

    # Process line by line
    lines = body.split('\n')
    fixed_lines = []

    for line in lines:
        # Remove "What's Changed" lines completely
        if re.match(r'^#+ What\'?s Changed', line, re.IGNORECASE):
            continue

        # Convert ## (h2) to ### (h3) for categories
        if line.startswith('## '):
            line = '#' + line  # ## -> ###
        # Convert # (h1) to ### (h3)
        elif line.startswith('# ') and not line.startswith('## '):
            line = '##' + line  # # -> ###

        fixed_lines.append(line)

    body = '\n'.join(fixed_lines).strip()

    # Create entry with separator
    return f"## {version} ({date_str})\n\n{body}\n\n---\n\n"

def update_changelog(releases_file, changelog_file):
    """Update CHANGELOG.md with new releases."""
    releases = parse_releases(releases_file)

    if not releases:
        print("No new releases to add")
        return 0

    # Generate changelog entries
    changelog_entries = []
    for version, data in releases:
        entry = format_changelog_entry(version, data)
        if entry:
            changelog_entries.append(entry)

    if not changelog_entries:
        print("No valid releases to add")
        return 0

    # Read current CHANGELOG.md
    changelog_path = Path(changelog_file)
    if changelog_path.exists():
        with open(changelog_path, 'r') as f:
            current_changelog = f.read()

        lines = current_changelog.split('\n')
        header_line = lines[0]  # "# Changelog"

        # Find where old content starts
        old_content_start = None
        for i, line in enumerate(lines):
            if line.startswith('## v'):
                old_content_start = i
                break

        if old_content_start:
            old_content = '\n'.join(lines[old_content_start:])
        else:
            old_content = '\n'.join(lines[1:])
    else:
        header_line = "# Changelog"
        old_content = ""

    # Create new changelog
    new_changelog = header_line + '\n\n' + ''.join(changelog_entries) + old_content

    # Write updated changelog
    with open(changelog_path, 'w') as f:
        f.write(new_changelog)

    print(f"✓ Added {len(changelog_entries)} releases to CHANGELOG.md")
    return len(changelog_entries)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: update_changelog.py <releases_file> <changelog_file>")
        sys.exit(1)

    releases_file = sys.argv[1]
    changelog_file = sys.argv[2]

    count = update_changelog(releases_file, changelog_file)
    sys.exit(0 if count > 0 else 1)
PYTHON_SCRIPT

    chmod +x "$python_script"
    echo "$python_script"
}

# Main execution
main() {
    log_info "Starting CHANGELOG.md update process"

    # Check prerequisites
    check_prerequisites

    # Get latest version from CHANGELOG
    latest_version=$(get_latest_changelog_version)

    # Fetch releases
    releases_file=$(fetch_releases "$latest_version")

    # Check if we have any new releases
    if [ ! -s "$releases_file" ] || ! grep -q "^=== v" "$releases_file"; then
        log_info "No new releases to add. CHANGELOG.md is up to date."
        rm -rf "$TEMP_DIR"
        exit 0
    fi

    # Generate and run Python script
    log_info "Updating CHANGELOG.md..."
    python_script=$(generate_python_script "$releases_file")
    python3 "$python_script" "$releases_file" "$CHANGELOG_FILE"

    # Cleanup
    rm -rf "$TEMP_DIR"

    log_info "CHANGELOG.md has been updated successfully!"
    log_info "Review the changes and commit them if they look good."
}

# Handle script interruption
trap 'log_error "Script interrupted"; rm -rf "$TEMP_DIR"; exit 1' INT TERM

# Run main function
main "$@"

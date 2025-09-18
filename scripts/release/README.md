# Release Scripts

This directory contains automation scripts for the Backend.AI WebUI release process.

## Scripts

### `utils.js`
Common utilities for release automation:
- Git operations (tags, branches, commits)
- Version parsing and comparison
- Package.json operations
- File system helpers

### `plan.js`
Version planning and release type determination:
```bash
node plan.js <releaseType> [baseMinor] [forceVersion]
```

Examples:
```bash
# Plan minor release
node plan.js minor 25.16

# Plan patch release
node plan.js patch 25.15

# Plan RC release
node plan.js rc 25.16

# Plan final release (promote RC)
node plan.js final 25.16

# Force specific version
node plan.js minor 25.16 25.16.5
```

### `generate-notes.js`
Release notes generation from git commits:
```bash
node generate-notes.js <fromTag> [toRef] [version]
```

Examples:
```bash
# Generate notes from latest tag to HEAD
node generate-notes.js v25.15.0

# Generate notes between specific refs
node generate-notes.js v25.15.0 HEAD 25.16.0

# Generate notes for specific version
node generate-notes.js v25.15.0 v25.16.0 25.16.0
```

### `teams-notify.js`
Microsoft Teams notification sender:
```bash
node teams-notify.js <webhookUrl> <version> <tag> [releaseUrl] [isPrerelease] [isSuccess] [error]
```

Example:
```bash
node teams-notify.js \
  "https://outlook.office.com/webhook/..." \
  "25.16.0" \
  "v25.16.0" \
  "https://github.com/lablup/backend.ai-webui/releases/tag/v25.16.0" \
  "false" \
  "true"
```

## Usage

These scripts are primarily used by the GitHub Actions workflow (`.github/workflows/release.yml`), but can also be run manually for testing or troubleshooting.

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- Git repository with proper remote setup
- GitHub CLI (`gh`) for some operations

### Development

To test scripts locally:

```bash
# Install dependencies
npm install

# Test version planning
node scripts/release/plan.js minor 25.16

# Test release notes generation
node scripts/release/generate-notes.js HEAD~10 HEAD 25.16.0

# Test with dry run
DRY_RUN=true node scripts/release/plan.js minor 25.16
```

## Output Formats

### Plan Output (JSON)
```json
{
  "version": "25.16.0",
  "tag": "v25.16.0", 
  "branch": "25.16",
  "needsNewBranch": true,
  "isPrerelease": false,
  "releaseType": "minor"
}
```

### Release Notes Output (Markdown)
```markdown
# Release 25.16.0

**Full Changelog**: https://github.com/lablup/backend.ai-webui/compare/v25.15.0...v25.16.0

## ✨ Features
- New feature description **FR-1234** by @author [#123](link)

## 🐛 Bug Fixes  
- Bug fix description **FR-1235** by @author [#124](link)
```

## Error Handling

Scripts include comprehensive error handling and validation:
- Input parameter validation
- Git operation error handling
- Version format validation
- Conflict detection (existing tags, branches)
- Network error handling (Teams notifications)

## Integration

These scripts integrate with:
- GitHub Actions workflows
- Git repository operations
- GitHub API (via CLI)
- Microsoft Teams webhooks
- Backend.AI WebUI build system (`make` targets)
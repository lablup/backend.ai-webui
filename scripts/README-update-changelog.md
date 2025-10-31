# Update CHANGELOG Script

This script automatically updates `CHANGELOG.md` with missing releases from GitHub.

## Overview

The `update-changelog.sh` script:
- Fetches all stable releases from GitHub (excluding pre-releases like rc, beta, alpha)
- Identifies new releases not yet in `CHANGELOG.md`
- Formats them according to the project's markdown hierarchy
- Updates `CHANGELOG.md` with proper structure

## Prerequisites

### Required Tools

1. **GitHub CLI (`gh`)**
   ```bash
   # Install on macOS
   brew install gh

   # Authenticate
   gh auth login
   ```

2. **Python 3**
   ```bash
   # Check if installed
   python3 --version
   ```

## Usage

### Basic Usage

From the project root:

```bash
./scripts/update-changelog.sh
```

The script will:
1. Check prerequisites (gh, python3, authentication)
2. Fetch new releases from GitHub
3. Update `CHANGELOG.md` with proper formatting
4. Display summary of changes

### Example Output

```
[INFO] Checking prerequisites...
[INFO] All prerequisites met
[INFO] Starting CHANGELOG.md update process
[INFO] Fetching releases from GitHub...
[INFO] Latest version in CHANGELOG: v24.03.0
Processing v25.15.2...
Processing v25.15.1...
...
[INFO] Fetched 57 new releases
[INFO] Updating CHANGELOG.md...
✓ Added 57 releases to CHANGELOG.md
[INFO] CHANGELOG.md has been updated successfully!
[INFO] Review the changes and commit them if they look good.
```

## Markdown Structure

The script maintains the following hierarchy:

```markdown
# Changelog

## v25.15.2 (24/10/2025)          ← h2: Version

### ✨ Features                    ← h3: Category
- Feature description

### 🐛 Bug Fixes                   ← h3: Category
- Bug fix description

---                                ← Separator

## v25.15.1 (24/10/2025)          ← Next version
...
```

### Header Rules

- **h1 (`#`)**: Document title only (`# Changelog`)
- **h2 (`##`)**: Version headers (`## v25.15.2`)
- **h3 (`###`)**: Category headers (`### ✨ Features`, `### 🐛 Bug Fixes`, etc.)
- **Separators**: `---` between each version

### Categories

Common categories include:
- ✨ Features
- 🐛 Bug Fixes
- 🔨 Refactoring
- 🛠 Chores
- 🎨 Style
- 🧪 E2E Tests
- 📝 Documentation

## How It Works

### 1. Version Detection

The script reads `CHANGELOG.md` to find the latest version:
```bash
grep -m 1 "^## v" CHANGELOG.md
```

### 2. Release Fetching

Uses GitHub CLI to fetch releases:
```bash
gh release list --repo lablup/backend.ai-webui --limit 100 --exclude-pre-releases
```

### 3. Processing

For each release:
- Extracts version and publish date
- Formats the body content
- Fixes header levels:
  - Removes "What's Changed" headers
  - Converts h1 to h3
  - Converts h2 to h3 for categories
- Adds version separator

### 4. Update

- Prepends new releases to existing `CHANGELOG.md`
- Maintains existing content
- Preserves formatting

## Troubleshooting

### GitHub CLI Not Authenticated

```
[ERROR] GitHub CLI is not authenticated
[ERROR] Run: gh auth login
```

**Solution**: Run `gh auth login` and follow the prompts.

### No New Releases

```
[INFO] No new releases to add. CHANGELOG.md is up to date.
```

This is normal if `CHANGELOG.md` is already current.

### Rate Limiting

If you hit GitHub API rate limits, wait an hour or authenticate with a token that has higher limits.

## Development

### Script Location

```
scripts/update-changelog.sh
```

### Temporary Files

The script creates temporary files in `/tmp/changelog-update-$$` and cleans them up automatically.

### Testing

To test without modifying `CHANGELOG.md`:

1. Backup your changelog:
   ```bash
   cp CHANGELOG.md CHANGELOG.md.backup
   ```

2. Run the script:
   ```bash
   ./scripts/update-changelog.sh
   ```

3. Review changes and restore if needed:
   ```bash
   mv CHANGELOG.md.backup CHANGELOG.md
   ```

## Maintenance

### Updating the Script

The Python processing logic is embedded in the shell script. To modify:

1. Edit `update-changelog.sh`
2. Locate the `generate_python_script()` function
3. Modify the Python code within the heredoc

### Adding New Categories

The script automatically handles any category headers from GitHub releases. No changes needed for new emoji categories.

## Related Files

- `CHANGELOG.md` - The changelog file being updated
- `scripts/update-changelog.sh` - Main script
- `.github/workflows/` - Could be integrated into CI/CD

## License

Same as the project license.

#!/bin/bash

# Backup Current State Script for Backend.AI Guide Renaming Project
# Creates a complete backup before starting any renaming operations

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$BASE_DIR/.backup-$(date +%Y%m%d-%H%M%S)"

echo "=== Backend.AI Guide State Backup ==="
echo "Base directory: $BASE_DIR"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Creating complete backup of current state..."

# Backup source files
echo "  • Backing up src/ directory..."
cp -r "$BASE_DIR/src" "$BACKUP_DIR/"

# Backup scripts
echo "  • Backing up scripts/ directory..."
cp -r "$BASE_DIR/scripts" "$BACKUP_DIR/"

# Backup documentation
echo "  • Backing up documentation files..."
find "$BASE_DIR" -maxdepth 1 -name "*.md" -exec cp {} "$BACKUP_DIR/" \;

# Create manifest of current state
echo "  • Creating state manifest..."
cat > "$BACKUP_DIR/MANIFEST.md" << EOF
# Backend.AI Guide State Backup

**Created**: $(date)
**Backup Directory**: $BACKUP_DIR

## Structure Snapshot

### README.md Files
\`\`\`
$(find "$BASE_DIR/src" -name "README.md" | wc -l) total README.md files found:
$(find "$BASE_DIR/src" -name "README.md" | sort)
\`\`\`

### Image Files
\`\`\`
$(find "$BASE_DIR/src" -name "*.png" -o -name "*.jpg" -o -name "*.svg" | wc -l) total image files found

Problematic images:
$(find "$BASE_DIR/src" -name "image ([0-9]*).png" -o -name "*스크린샷*.png" | sort)
\`\`\`

### Navigation References
\`\`\`
$(grep -c "README.md" "$BASE_DIR/src/book.config.yaml" || echo "0") README.md references in navigation config
\`\`\`

## Restoration

To restore this state:
1. Stop any ongoing renaming operations
2. Remove current src/ directory: \`rm -rf "$BASE_DIR/src"\`
3. Restore backup: \`cp -r "$BACKUP_DIR/src" "$BASE_DIR/"\`
4. Restore other files as needed

## Git Information
\`\`\`
Current branch: $(git branch --show-current 2>/dev/null || echo "unknown")
Last commit: $(git log -1 --oneline 2>/dev/null || echo "unknown")
Working tree: $(git status --porcelain | wc -l) modified files
\`\`\`
EOF

# Create restoration script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
# Restoration script for Backend.AI Guide backup

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Restoring Backend.AI Guide from Backup ==="
echo "Backup: $SCRIPT_DIR"
echo "Target: $BASE_DIR"
echo ""

read -p "⚠️  This will overwrite current files. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restoration cancelled."
    exit 1
fi

echo "🔄 Restoring files..."

# Restore src directory
if [ -d "$SCRIPT_DIR/src" ]; then
    echo "  • Restoring src/ directory..."
    rm -rf "$BASE_DIR/src"
    cp -r "$SCRIPT_DIR/src" "$BASE_DIR/"
fi

# Restore scripts
if [ -d "$SCRIPT_DIR/scripts" ]; then
    echo "  • Restoring scripts/ directory..."
    rm -rf "$BASE_DIR/scripts"
    cp -r "$SCRIPT_DIR/scripts" "$BASE_DIR/"
fi

# Restore documentation files
echo "  • Restoring documentation files..."
find "$SCRIPT_DIR" -maxdepth 1 -name "*.md" -exec cp {} "$BASE_DIR/" \;

echo ""
echo "✅ Restoration complete!"
echo "📊 Run validation: bash scripts/validate-links.sh"
EOF

chmod +x "$BACKUP_DIR/restore.sh"

# Calculate backup size
backup_size=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "✅ Backup completed successfully!"
echo "📊 Backup size: $backup_size"
echo "📂 Backup location: $BACKUP_DIR"
echo "🔄 To restore: bash $BACKUP_DIR/restore.sh"
echo ""
echo "Next steps:"
echo "1. Review MANIFEST.md in backup directory"
echo "2. Run link validation: bash scripts/validate-links.sh"
echo "3. Begin renaming operations with confidence"
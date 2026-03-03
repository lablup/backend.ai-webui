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

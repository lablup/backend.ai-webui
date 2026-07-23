#!/bin/bash

# Fix irregular whitespace in i18n JSON files
# Replaces non-breaking spaces, ideographic spaces, and other irregular whitespace with regular spaces
# Usage: ./scripts/fix-irregular-whitespace.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# All i18n JSON files
files=(
  # resources/i18n directory
  "resources/i18n/de.json"
  "resources/i18n/el.json"
  "resources/i18n/en.json"
  "resources/i18n/es.json"
  "resources/i18n/fi.json"
  "resources/i18n/fr.json"
  "resources/i18n/id.json"
  "resources/i18n/it.json"
  "resources/i18n/ja.json"
  "resources/i18n/ko.json"
  "resources/i18n/mn.json"
  "resources/i18n/ms.json"
  "resources/i18n/pl.json"
  "resources/i18n/pt-BR.json"
  "resources/i18n/pt.json"
  "resources/i18n/ru.json"
  "resources/i18n/th.json"
  "resources/i18n/tr.json"
  "resources/i18n/vi.json"
  "resources/i18n/zh-CN.json"
  "resources/i18n/zh-TW.json"

  # packages/backend.ai-ui/src/locale directory
  "packages/backend.ai-ui/src/locale/de.json"
  "packages/backend.ai-ui/src/locale/el.json"
  "packages/backend.ai-ui/src/locale/en.json"
  "packages/backend.ai-ui/src/locale/es.json"
  "packages/backend.ai-ui/src/locale/fi.json"
  "packages/backend.ai-ui/src/locale/fr.json"
  "packages/backend.ai-ui/src/locale/id.json"
  "packages/backend.ai-ui/src/locale/it.json"
  "packages/backend.ai-ui/src/locale/ja.json"
  "packages/backend.ai-ui/src/locale/ko.json"
  "packages/backend.ai-ui/src/locale/mn.json"
  "packages/backend.ai-ui/src/locale/ms.json"
  "packages/backend.ai-ui/src/locale/pl.json"
  "packages/backend.ai-ui/src/locale/pt-BR.json"
  "packages/backend.ai-ui/src/locale/pt.json"
  "packages/backend.ai-ui/src/locale/ru.json"
  "packages/backend.ai-ui/src/locale/th.json"
  "packages/backend.ai-ui/src/locale/tr.json"
  "packages/backend.ai-ui/src/locale/vi.json"
  "packages/backend.ai-ui/src/locale/zh-CN.json"
  "packages/backend.ai-ui/src/locale/zh-TW.json"
)

fixed_count=0
skipped_count=0

echo "Fixing irregular whitespace in i18n JSON files..."
echo ""

for file in "${files[@]}"; do
  full_path="$PROJECT_ROOT/$file"

  if [ ! -f "$full_path" ]; then
    echo "⊘ Skip $file - not found"
    skipped_count=$((skipped_count + 1))
    continue
  fi

  # Create temporary file
  temp_file=$(mktemp)

  # Use node to handle Unicode replacement properly
  result=$(node -e "
    const fs = require('fs');
    let content = fs.readFileSync('$full_path', 'utf8');
    const original = content;

    // Replace irregular whitespace with regular space
    content = content.replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, ' ');

    // Collapse multiple consecutive spaces within JSON string values
    content = content.replace(/\"([^\"\\\\]|\\\\.)*\"/g, (match) => match.replace(/ {2,}/g, ' '));

    if (content !== original) {
      fs.writeFileSync('$temp_file', content, 'utf8');
      console.log('CHANGED');
    } else {
      console.log('UNCHANGED');
    }
  " 2>/dev/null) || {
    rm -f "$temp_file"
    echo "⊘ Skip $file - error processing"
    skipped_count=$((skipped_count + 1))
    continue
  }

  if [ "$result" = "CHANGED" ]; then
    mv "$temp_file" "$full_path"
    echo "✓ Fixed: $file"
    fixed_count=$((fixed_count + 1))
  else
    rm -f "$temp_file"
  fi
done

echo ""
echo "✓ Done! Fixed $fixed_count files, skipped $skipped_count files."

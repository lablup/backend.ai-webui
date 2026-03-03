#!/bin/bash

# Image Usage Analysis Script
# Finds orphaned and referenced images

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR/src/en"

echo "=== Image Usage Analysis ==="
echo "Working directory: $(pwd)"
echo ""

orphaned_images=()
referenced_images=()

# Analyze all image files
echo "Analyzing image files..."
for img_file in images/*.png images/*.svg images/*.jpg images/*.webp; do
    if [ -f "$img_file" ]; then
        img_name=$(basename "$img_file")

        # Count references in markdown files
        ref_count=$(grep -r "images/$img_name" . --include="*.md" 2>/dev/null | wc -l | tr -d ' ')

        if [ "$ref_count" -eq 0 ]; then
            orphaned_images+=("$img_name")
        else
            referenced_images+=("$img_name:$ref_count")
        fi
    fi
done

echo ""
echo "=== ORPHANED IMAGES (unused) ==="
echo "Count: ${#orphaned_images[@]}"
for img in "${orphaned_images[@]}"; do
    echo "  $img"
done

echo ""
echo "=== REFERENCED IMAGES (used) ==="
echo "Count: ${#referenced_images[@]}"
for img_ref in "${referenced_images[@]}"; do
    img_name="${img_ref%:*}"
    ref_count="${img_ref#*:}"
    echo "  $img_name ($ref_count references)"
done

echo ""
echo "=== SUMMARY ==="
echo "  Total images: $((${#orphaned_images[@]} + ${#referenced_images[@]}))"
echo "  Orphaned (safe to delete): ${#orphaned_images[@]}"
echo "  Referenced (need renaming): ${#referenced_images[@]}"

echo ""
echo "=== PROBLEMATIC REFERENCED IMAGES ==="
echo "Images that need renaming:"
for img_ref in "${referenced_images[@]}"; do
    img_name="${img_ref%:*}"
    ref_count="${img_ref#*:}"

    # Check if image has problematic name
    if echo "$img_name" | grep -E "(^image \([0-9]+\)\.png$|^스크린샷|.*\([0-9]+.*\([0-9]+.*\([0-9]+)" >/dev/null; then
        echo "  ❗ $img_name ($ref_count references) - NEEDS RENAMING"
    fi
done
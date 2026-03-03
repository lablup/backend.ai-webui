#!/bin/bash

# Backend.AI Guide Structure Analysis Script
# Analyzes README.md files and image references for the renaming project

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$BASE_DIR/src"

echo "=== Backend.AI Guide Structure Analysis ==="
echo "Base directory: $BASE_DIR"
echo ""

# Function to analyze README.md files
analyze_readmes() {
    local lang_dir=$1
    local lang=$2

    echo "--- README.md Analysis for $lang ---"
    if [ ! -d "$lang_dir" ]; then
        echo "❌ Directory $lang_dir does not exist"
        return 1
    fi

    local readme_files=$(find "$lang_dir" -name "README.md" | sort)
    local total_count=$(echo "$readme_files" | wc -l)

    echo "Total README.md files: $total_count"
    echo ""

    # List all README files with their content purpose
    echo "README.md files found:"
    while IFS= read -r file; do
        if [ -n "$file" ]; then
            local rel_path=${file#$lang_dir/}
            local title=$(head -20 "$file" | grep -E "^#[^#]" | head -1 | sed 's/^#[[:space:]]*//' || echo "No title found")
            echo "  $rel_path -> '$title'"
        fi
    done <<< "$readme_files"
    echo ""
}

# Function to analyze image files
analyze_images() {
    local lang_dir=$1
    local lang=$2

    echo "--- Image Analysis for $lang ---"
    local image_dir="$lang_dir/images"

    if [ ! -d "$image_dir" ]; then
        echo "❌ Images directory $image_dir does not exist"
        return 1
    fi

    local total_images=$(find "$image_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" \) | wc -l)
    echo "Total image files: $total_images"

    # Problematic image files
    echo ""
    echo "Problematic image files:"

    # Sequential generics
    local sequential=$(find "$image_dir" -name "image ([0-9]*).png" | sort -V)
    if [ -n "$sequential" ]; then
        echo "  Sequential generics ($(echo "$sequential" | wc -l)):"
        echo "$sequential" | while read file; do
            echo "    ${file#$image_dir/}"
        done
    fi

    # Korean/non-English filenames
    local korean=$(find "$image_dir" -name "*스크린샷*.png")
    if [ -n "$korean" ]; then
        echo "  Korean filenames ($(echo "$korean" | wc -l)):"
        echo "$korean" | while read file; do
            echo "    ${file#$image_dir/}"
        done
    fi

    # Duplicates with (1), (2) etc
    local duplicates=$(find "$image_dir" -name "* ([0-9]*)*" | grep -v "image (" || true)
    if [ -n "$duplicates" ]; then
        echo "  Duplicates ($(echo "$duplicates" | wc -l)):"
        echo "$duplicates" | while read file; do
            echo "    ${file#$image_dir/}"
        done
    fi

    echo ""
}

# Function to find image references in markdown files
analyze_image_references() {
    local lang_dir=$1
    local lang=$2

    echo "--- Image Reference Analysis for $lang ---"

    # Find all image references in markdown files
    local refs=$(find "$lang_dir" -name "*.md" -exec grep -l "!\[.*\](images/" {} \; | wc -l)
    echo "Markdown files with image references: $refs"

    # Extract all unique image references
    local unique_refs=$(find "$lang_dir" -name "*.md" -exec grep -ho "!\[.*\](images/[^)]*)" {} \; | sed 's/!\[.*\](images\/\([^)]*\))/\1/' | sort -u | wc -l)
    echo "Unique image references: $unique_refs"

    # Find potentially orphaned images
    local image_dir="$lang_dir/images"
    if [ -d "$image_dir" ]; then
        echo ""
        echo "Checking for orphaned images..."
        find "$image_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.svg" \) | while read img_file; do
            local img_name=$(basename "$img_file")
            local ref_count=$(find "$lang_dir" -name "*.md" -exec grep -l "images/$img_name" {} \; | wc -l)
            if [ "$ref_count" -eq 0 ]; then
                echo "  🗑️  Orphaned: $img_name"
            fi
        done
    fi
    echo ""
}

# Function to analyze navigation config
analyze_navigation() {
    echo "--- Navigation Configuration Analysis ---"
    local config_file="$SRC_DIR/book.config.yaml"

    if [ ! -f "$config_file" ]; then
        echo "❌ book.config.yaml not found at $config_file"
        return 1
    fi

    echo "Navigation file: $config_file"

    # Count README.md references in navigation
    local readme_refs=$(grep -c "README.md" "$config_file" || echo "0")
    echo "README.md references in navigation: $readme_refs"

    # Extract unique README.md paths from navigation
    echo ""
    echo "Navigation paths pointing to README.md:"
    grep "README.md" "$config_file" | sed 's/.*path:[[:space:]]*"*\([^"]*\)"*.*/\1/' | sort -u | while read path; do
        echo "  $path"
    done
    echo ""
}

# Main analysis
echo "Starting comprehensive structure analysis..."
echo ""

# Active languages based on book.config.yaml
LANGUAGES=("en" "ko" "ja" "th")

for lang in "${LANGUAGES[@]}"; do
    lang_dir="$SRC_DIR/$lang"
    echo "==============================================="
    echo "ANALYZING LANGUAGE: $lang"
    echo "==============================================="

    if [ -d "$lang_dir" ]; then
        analyze_readmes "$lang_dir" "$lang"
        analyze_images "$lang_dir" "$lang"
        analyze_image_references "$lang_dir" "$lang"
    else
        echo "❌ Language directory $lang_dir does not exist"
        echo ""
    fi
done

# Global navigation analysis
echo "==============================================="
echo "GLOBAL CONFIGURATION ANALYSIS"
echo "==============================================="
analyze_navigation

echo ""
echo "=== Analysis Complete ==="
echo "Review the output above to understand the current structure before proceeding with renaming."
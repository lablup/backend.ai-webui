#!/bin/bash

# Link Validation Script for Backend.AI Guide
# Validates internal links and image references across all languages

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$BASE_DIR/src"

echo "=== Backend.AI Guide Link Validation ==="
echo "Base directory: $BASE_DIR"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
total_broken=0
total_checked=0

# Function to check if file exists
check_file_exists() {
    local file_path=$1
    local referring_file=$2
    local line_num=$3

    if [ ! -f "$file_path" ]; then
        echo -e "${RED}❌ BROKEN:${NC} $referring_file:$line_num -> $file_path"
        ((total_broken++))
        return 1
    fi
    return 0
}

# Function to validate image references
validate_images() {
    local lang_dir=$1
    local lang=$2

    echo "--- Validating Image References ($lang) ---"
    local broken_count=0
    local checked_count=0

    if [ ! -d "$lang_dir" ]; then
        echo -e "${YELLOW}⚠️  Directory $lang_dir does not exist${NC}"
        return 0
    fi

    # Find all image references in markdown files
    find "$lang_dir" -name "*.md" -type f | while read md_file; do
        local line_num=0
        while IFS= read -r line; do
            ((line_num++))

            # Extract image references: ![...](images/filename.ext)
            echo "$line" | grep -o '!\[.*\](images/[^)]*' | while read img_ref; do
                # Extract the image path
                local img_path=$(echo "$img_ref" | sed 's/!\[.*\](images\///' | sed 's/)$//')
                local full_img_path="$lang_dir/images/$img_path"

                ((total_checked++))
                ((checked_count++))

                if ! check_file_exists "$full_img_path" "$md_file" "$line_num"; then
                    ((broken_count++))
                fi
            done
        done < "$md_file"
    done

    if [ $broken_count -eq 0 ]; then
        echo -e "${GREEN}✅ All image references valid ($checked_count checked)${NC}"
    else
        echo -e "${RED}❌ Found $broken_count broken image references${NC}"
    fi
    echo ""
}

# Function to validate markdown cross-references
validate_cross_references() {
    local lang_dir=$1
    local lang=$2

    echo "--- Validating Cross-References ($lang) ---"
    local broken_count=0
    local checked_count=0

    if [ ! -d "$lang_dir" ]; then
        echo -e "${YELLOW}⚠️  Directory $lang_dir does not exist${NC}"
        return 0
    fi

    # Find markdown cross-references: [text](relative/path.md)
    find "$lang_dir" -name "*.md" -type f | while read md_file; do
        local line_num=0
        while IFS= read -r line; do
            ((line_num++))

            # Extract markdown links that are relative paths
            echo "$line" | grep -o '\[[^]]*\]([^)]*\.md[^)]*)' | while read link_ref; do
                # Extract the file path
                local ref_path=$(echo "$link_ref" | sed 's/\[[^]]*\](\([^)]*\))/\1/' | sed 's/#.*//')

                # Skip external links (http, https) and anchors only
                if [[ "$ref_path" =~ ^https?:// ]] || [[ "$ref_path" =~ ^# ]]; then
                    continue
                fi

                # Convert relative path to absolute
                local dir_path=$(dirname "$md_file")
                local full_ref_path="$dir_path/$ref_path"

                # Normalize path (resolve .. and .)
                full_ref_path=$(cd "$dir_path" && realpath "$ref_path" 2>/dev/null || echo "$full_ref_path")

                ((total_checked++))
                ((checked_count++))

                if ! check_file_exists "$full_ref_path" "$md_file" "$line_num"; then
                    ((broken_count++))
                fi
            done
        done < "$md_file"
    done

    if [ $broken_count -eq 0 ]; then
        echo -e "${GREEN}✅ All cross-references valid ($checked_count checked)${NC}"
    else
        echo -e "${RED}❌ Found $broken_count broken cross-references${NC}"
    fi
    echo ""
}

# Function to validate navigation config
validate_navigation() {
    echo "--- Validating Navigation Configuration ---"
    local config_file="$SRC_DIR/book.config.yaml"
    local broken_count=0

    if [ ! -f "$config_file" ]; then
        echo -e "${RED}❌ Navigation config file not found: $config_file${NC}"
        return 1
    fi

    # Extract all path references from navigation
    grep -n "path:" "$config_file" | while read line_info; do
        local line_num=$(echo "$line_info" | cut -d: -f1)
        local path_line=$(echo "$line_info" | cut -d: -f2-)

        # Extract the file path
        local file_path=$(echo "$path_line" | sed 's/.*path:[[:space:]]*"*\([^"]*\)"*.*/\1/')

        # Check in each active language directory
        for lang in en ko ja th; do
            local full_path="$SRC_DIR/$lang/$file_path"
            ((total_checked++))

            if [ -d "$SRC_DIR/$lang" ] && ! check_file_exists "$full_path" "book.config.yaml" "$line_num"; then
                ((broken_count++))
            fi
        done
    done

    if [ $broken_count -eq 0 ]; then
        echo -e "${GREEN}✅ All navigation paths valid${NC}"
    else
        echo -e "${RED}❌ Found $broken_count broken navigation paths${NC}"
    fi
    echo ""
}

# Function to check for duplicate filenames across languages
check_filename_consistency() {
    echo "--- Checking Cross-Language Filename Consistency ---"

    local inconsistencies=0

    # Compare en with other languages
    if [ -d "$SRC_DIR/en" ]; then
        for lang in ko ja th; do
            if [ -d "$SRC_DIR/$lang" ]; then
                echo "Comparing en with $lang..."

                # Find files in en that don't exist in other language
                find "$SRC_DIR/en" -name "*.md" -o -name "*.png" -o -name "*.jpg" -o -name "*.svg" | while read en_file; do
                    local rel_path=${en_file#$SRC_DIR/en/}
                    local other_file="$SRC_DIR/$lang/$rel_path"

                    if [ ! -f "$other_file" ] && [ ! "$rel_path" == "README.md" ]; then
                        echo -e "${YELLOW}⚠️  Missing in $lang: $rel_path${NC}"
                        ((inconsistencies++))
                    fi
                done
            fi
        done
    fi

    if [ $inconsistencies -eq 0 ]; then
        echo -e "${GREEN}✅ Filename structure is consistent across languages${NC}"
    else
        echo -e "${YELLOW}⚠️  Found $inconsistencies filename inconsistencies${NC}"
    fi
    echo ""
}

# Main validation
echo "Starting comprehensive link validation..."
echo ""

# Active languages based on directory existence
LANGUAGES=("en" "ko" "ja" "th")

for lang in "${LANGUAGES[@]}"; do
    lang_dir="$SRC_DIR/$lang"

    if [ -d "$lang_dir" ]; then
        echo "==============================================="
        echo "VALIDATING LANGUAGE: $lang"
        echo "==============================================="

        validate_images "$lang_dir" "$lang"
        validate_cross_references "$lang_dir" "$lang"
    else
        echo "==============================================="
        echo "SKIPPING LANGUAGE: $lang (directory not found)"
        echo "==============================================="
        echo ""
    fi
done

echo "==============================================="
echo "GLOBAL VALIDATION"
echo "==============================================="

validate_navigation
check_filename_consistency

echo "==============================================="
echo "VALIDATION SUMMARY"
echo "==============================================="

if [ $total_broken -eq 0 ]; then
    echo -e "${GREEN}🎉 All links are valid! ($total_checked total checked)${NC}"
    exit 0
else
    echo -e "${RED}💥 Found $total_broken broken links out of $total_checked total checked${NC}"
    echo ""
    echo "Run this script after making changes to ensure link integrity."
    exit 1
fi
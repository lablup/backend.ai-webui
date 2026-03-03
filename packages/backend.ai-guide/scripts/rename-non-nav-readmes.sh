#!/bin/bash

# Batch rename script for non-navigation README.md files
# These are files NOT referenced in book.config.yaml navigation

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR"

echo "=== Renaming Non-Navigation README.md Files ==="
echo "Working directory: $(pwd)"
echo ""

# Define the renaming mappings
# Format: "path/to/README.md:new-filename.md"
NON_NAV_FILES=(
    "api-reference/manager-api-reference/README.md:manager-api-overview.md"
    "api-reference/manager-api-reference/manager-api-common-concepts/README.md:api-common-concepts.md"
    "api-reference/manager-api-reference/manager-rest-api/README.md:rest-api-reference.md"
    "backend.ai-overview/backend.ai-architecture/README.md:architecture-overview.md"
    "backend.ai-sdk/client-sdk-for-python/command-line-interface/README.md:python-sdk-cli-reference.md"
    "backend.ai-usage-guide/data-and-storage/README.md:profile-and-preferences.md"
    "backend.ai-usage-guide/playground/README.md:playground-overview.md"
    "backend.ai-usage-guide/playground/chat/README.md:chat-interface-guide.md"
    "backend.ai-usage-guide/preferences/README.md:metrics-and-preferences.md"
    "backend.ai-usage-guide/serving/README.md:model-serving-overview.md"
    "backend.ai-usage-guide/serving/serving/README.md:model-serving-guide.md"
    "backend.ai-usage-guide/serving/model-store/README.md:model-store-guide.md"
    "backend.ai-usage-guide/storage/README.md:storage-overview.md"
    "backend.ai-usage-guide/summary/README.md:usage-summary.md"
    "backend.ai-usage-guide/workload/README.md:workload-overview.md"
    "fasttrack-2-mlops/starting-fasttrack-2/README.md:fasttrack-getting-started.md"
    "fasttrack-2-mlops/pipelines/README.md:pipeline-overview.md"
    "fasttrack-2-mlops/pipeline-jobs/README.md:pipeline-jobs-guide.md"
    "get-started/run-applications/README.md:application-running-guide.md"
    "install-and-run/prerequisites/README.md:installation-prerequisites.md"
    "install-and-run/single-node-all-in-one/README.md:single-node-installation.md"
    "install-and-run/install-from-packages/README.md:package-installation-guide.md"
    "install-and-run/advanced-installation/README.md:multi-node-installation.md"
    "install-and-run/install-on-cloud-services/README.md:cloud-deployment-guide.md"
)

# Function to rename files in both languages and update SUMMARY.md
rename_file() {
    local old_path=$1
    local new_filename=$2
    local dir_path=$(dirname "$old_path")

    echo "📝 Renaming: $old_path -> $new_filename"

    # Check if files exist before renaming
    if [ ! -f "src/en/$old_path" ]; then
        echo "   ⚠️  English file not found: src/en/$old_path"
        return 1
    fi
    if [ ! -f "src/ko/$old_path" ]; then
        echo "   ⚠️  Korean file not found: src/ko/$old_path"
        return 1
    fi

    # Rename English file
    mv "src/en/$old_path" "src/en/$dir_path/$new_filename"
    echo "   ✅ English: src/en/$dir_path/$new_filename"

    # Rename Korean file
    mv "src/ko/$old_path" "src/ko/$dir_path/$new_filename"
    echo "   ✅ Korean: src/ko/$dir_path/$new_filename"

    # Update SUMMARY.md files
    local old_ref="$old_path"
    local new_ref="$dir_path/$new_filename"

    # Update English SUMMARY.md
    if grep -q "$old_ref" "src/en/SUMMARY.md" 2>/dev/null; then
        sed -i '' "s|$old_ref|$new_ref|g" "src/en/SUMMARY.md"
        echo "   📄 Updated English SUMMARY.md"
    fi

    # Update Korean SUMMARY.md
    if grep -q "$old_ref" "src/ko/SUMMARY.md" 2>/dev/null; then
        sed -i '' "s|$old_ref|$new_ref|g" "src/ko/SUMMARY.md"
        echo "   📄 Updated Korean SUMMARY.md"
    fi

    # Update en_gitbook_full SUMMARY.md if it exists
    if [ -f "src/en_gitbook_full/SUMMARY.md" ] && grep -q "$old_ref" "src/en_gitbook_full/SUMMARY.md" 2>/dev/null; then
        sed -i '' "s|$old_ref|$new_ref|g" "src/en_gitbook_full/SUMMARY.md"
        echo "   📄 Updated en_gitbook_full SUMMARY.md"
    fi

    echo ""
}

# Main processing
total_files=${#NON_NAV_FILES[@]}
processed=0
errors=0

echo "Processing $total_files non-navigation README.md files..."
echo ""

for file_mapping in "${NON_NAV_FILES[@]}"; do
    # Parse mapping
    old_path="${file_mapping%%:*}"
    new_filename="${file_mapping##*:}"

    if rename_file "$old_path" "$new_filename"; then
        ((processed++))
    else
        ((errors++))
        echo "   ❌ Failed to rename: $old_path"
    fi
done

echo "=== Batch Rename Summary ==="
echo "Total files: $total_files"
echo "Processed successfully: $processed"
echo "Errors: $errors"
echo ""

if [ $errors -eq 0 ]; then
    echo "🎉 All non-navigation README.md files renamed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run validation: bash scripts/validate-links.sh"
    echo "2. Test builds for each language"
    echo "3. Proceed with navigation-critical README files"
else
    echo "⚠️  Some files had errors. Please review and fix before proceeding."
fi
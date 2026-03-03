#!/bin/bash

# Navigation Consistency Verification Script
# Verifies that renamed files are properly reflected in book.config.yaml

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR"

echo "=== Navigation Consistency Verification ==="
echo "Working directory: $(pwd)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Extract all path references from book.config.yaml for English section
echo "📋 Extracting navigation paths from book.config.yaml..."
navigation_paths=$(awk '
/^  en:/,/^  ko:/ {
    if (/path:/ && !/^  ko:/) {
        gsub(/.*path:[[:space:]]*"*/, "")
        gsub(/".*/, "")
        print
    }
}' src/book.config.yaml)

echo "Found navigation paths:"
echo "$navigation_paths" | while read path; do
    echo "  📄 $path"
done
echo ""

# Check if each navigation path exists in file system
echo "🔍 Verifying navigation paths exist..."
missing_count=0
total_count=0

echo "$navigation_paths" | while read path; do
    if [ -n "$path" ]; then
        ((total_count++))
        full_path="src/en/$path"
        if [ -f "$full_path" ]; then
            echo -e "  ${GREEN}✅${NC} $path"
        else
            echo -e "  ${RED}❌${NC} $path (FILE NOT FOUND)"
            ((missing_count++))
        fi
    fi
done

echo ""

# Find all our renamed files and check if they should be in navigation
echo "🔄 Checking our renamed files against navigation..."
echo ""

# List of files we renamed (non-navigation according to our analysis)
renamed_files=(
    "deprecated/forklift-key-concepts/forklift-concepts.md"
    "backend.ai-overview/enterprise-applicatioins/enterprise-applications-overview.md"
    "api-reference/manager-api-reference/manager-api-overview.md"
    "backend.ai-overview/backend.ai-architecture/architecture-overview.md"
    "backend.ai-usage-guide/playground/playground-overview.md"
    "api-reference/manager-api-reference/manager-api-common-concepts/api-common-concepts.md"
    "api-reference/manager-api-reference/manager-rest-api/rest-api-reference.md"
    "backend.ai-sdk/client-sdk-for-python/command-line-interface/python-sdk-cli-reference.md"
    "backend.ai-usage-guide/data-and-storage/profile-and-preferences.md"
    "backend.ai-usage-guide/playground/chat/chat-interface-guide.md"
    "backend.ai-usage-guide/preferences/metrics-and-preferences.md"
    "backend.ai-usage-guide/serving/model-serving-overview.md"
    "backend.ai-usage-guide/serving/serving/model-serving-guide.md"
    "backend.ai-usage-guide/serving/model-store/model-store-guide.md"
    "backend.ai-usage-guide/storage/storage-overview.md"
    "backend.ai-usage-guide/summary/usage-summary.md"
    "backend.ai-usage-guide/workload/workload-overview.md"
    "fasttrack-2-mlops/starting-fasttrack-2/fasttrack-getting-started.md"
    "fasttrack-2-mlops/pipelines/pipeline-overview.md"
    "fasttrack-2-mlops/pipeline-jobs/pipeline-jobs-guide.md"
    "get-started/run-applications/application-running-guide.md"
    "install-and-run/prerequisites/installation-prerequisites.md"
    "install-and-run/single-node-all-in-one/single-node-installation.md"
    "install-and-run/install-from-packages/package-installation-guide.md"
    "install-and-run/advanced-installation/multi-node-installation.md"
    "install-and-run/install-on-cloud-services/cloud-deployment-guide.md"
)

echo "Checking if our renamed files should be in navigation:"
should_be_in_nav=()

for file in "${renamed_files[@]}"; do
    # Check if this file should be in navigation by looking at similar patterns
    file_exists="src/en/$file"
    if [ -f "$file_exists" ]; then
        echo -e "  ${GREEN}✓${NC} $file (exists)"

        # Check if this file should be referenced in navigation based on content and location
        # Look for potential navigation references using directory pattern matching
        if echo "$navigation_paths" | grep -q "$(dirname "$file")/" 2>/dev/null; then
            echo -e "    ${YELLOW}⚠️${NC}  Directory is referenced in navigation - might need to be added"
            should_be_in_nav+=("$file")
        fi
    else
        echo -e "  ${RED}✗${NC} $file (missing)"
    fi
done

echo ""

# Check for directory-only references that might need specific file references
echo "🔍 Checking for directory-only references in navigation..."
echo "$navigation_paths" | while read path; do
    if [ -n "$path" ] && [ -d "src/en/$(dirname "$path")" ]; then
        dir_path="$(dirname "$path")"
        # Check if there are files in this directory that might be missing from navigation
        find "src/en/$dir_path" -name "*.md" ! -name "README.md" | while read found_file; do
            rel_file="${found_file#src/en/}"
            if ! echo "$navigation_paths" | grep -q "$rel_file"; then
                echo -e "  ${YELLOW}📁${NC} $rel_file in $dir_path/ not in navigation"
            fi
        done
    fi
done

echo ""

# Generate comprehensive report
echo "📊 COMPREHENSIVE ANALYSIS"
echo "=========================="

echo ""
echo -e "${BLUE}Navigation-critical README.md files (need book.config.yaml updates):${NC}"
nav_readme_files=(
    "README.md"
    "backend.ai-overview/backend.ai-architecture/service-components/README.md"
    "backend.ai-overview/faq/README.md"
    "install-and-run/single-node-all-in-one/install-from-binary/README.md"
    "backend.ai-usage-guide/storage/data/README.md"
    "backend.ai-usage-guide/workload/sessions/README.md"
    "backend.ai-usage-guide/workload/import-and-run/README.md"
    "cli-user/README.md"
    "cli-admin/README.md"
)

for readme_file in "${nav_readme_files[@]}"; do
    if [ -f "src/en/$readme_file" ]; then
        echo -e "  ${GREEN}✓${NC} $readme_file (exists, needs renaming + nav update)"
    else
        echo -e "  ${RED}✗${NC} $readme_file (missing - already renamed?)"
    fi
done

echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Navigation paths extracted from book.config.yaml: $(echo "$navigation_paths" | wc -l)"
echo "- README.md files needing navigation updates: ${#nav_readme_files[@]}"
echo "- Non-navigation files already renamed: ${#renamed_files[@]}"

echo ""
echo -e "${GREEN}✅ Verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify all navigation paths point to existing files"
echo "2. Update navigation-critical README.md files"
echo "3. Update book.config.yaml paths for those files"
echo "4. Ensure no renamed files were missed in navigation"
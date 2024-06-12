#!/bin/bash
brandName=$(jq -r '.branding.brandName' resources/theme.json)

# Function to update the title in index.html
updateTitle() {
    echo "Updating title in index.html..."
    # Extract brandName
    # Replace the content of the title tag with brandName
    sed -i'' -e "s/<title>.*<\/title>/<title>${brandName}<\/title>/g" index.html
    echo "Title updated to: $brandName"
}

# Function to process i18n JSON files
updateI18n() {
    echo "Processing i18n files..."
    # Loop through all json files in resources/i18n
    for file in resources/i18n/*.json; do
      echo "Processing $file..."
      # Create a temporary file
      tmp=$(mktemp)

      # Replace "Backend.AI" with brandName in a case-insensitive manner
      jq --arg brandName "$brandName" '
        walk(if type == "string" then
          gsub("(?i)Backend\\.AI"; $brandName)
        else .
        end)' "$file" > "$tmp" && mv "$tmp" "$file"
    done
    echo "i18n files processed."
}

# Check for command line options
case "$1" in
    --title-only)
        updateTitle
        ;;
    --i18n-only)
        # get the brand name from resources/theme.json
        updateI18n
        ;;
    *)
        updateTitle
        # get the brand name from resources/theme.json
        updateI18n
        ;;
esac
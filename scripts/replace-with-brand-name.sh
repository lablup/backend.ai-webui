#!/bin/bash

# get the brand name from resources/theme.json
brandName=$(jq -r '.branding.brandName' resources/theme.json)
echo "brandName: $brandName"

# loop through all json files in resources/i18n
for file in resources/i18n/*.json; do
  echo "Processing $file..."
  # create a temporary file
  tmp=$(mktemp)

  # replace "Backend.AI" with brandName in a case-insensitive manner
  # 'walk(if type == "string" then ... else . end)' traverses all strings and replaces if the condition is met
  jq --arg brandName "$brandName" '
    walk(if type == "string" then
      gsub("(?i)Backend\\.AI"; $brandName)
    else .
    end)' "$file" > "$tmp" && mv "$tmp" "$file"
  
done

echo "All files processed."

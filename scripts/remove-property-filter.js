#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of all language files in resources/i18n
const basePath = path.join(__dirname, '..', 'resources', 'i18n');

// Read all files in the i18n directory
fs.readdir(basePath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(filename => {
    if (filename.endsWith('.json')) {
      const filePath = path.join(basePath, filename);
      
      try {
        // Read the JSON file
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        // Remove the propertyFilter key if it exists
        if ('propertyFilter' in data) {
          delete data.propertyFilter;
          
          // Write the updated JSON back to file with trailing newline
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
          
          console.log(`Removed propertyFilter from ${filename}`);
        } else {
          console.log(`No propertyFilter found in ${filename}`);
        }
        
      } catch (error) {
        console.error(`Error processing ${filename}:`, error.message);
      }
    }
  });
});
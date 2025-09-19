const fs = require('fs');
const path = require('path');

// Read the index.html file
const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace all unsplash image URLs with local placeholders
content = content.replace(
  /https:\/\/source\.unsplash\.com\/random\/600x400\?[^"]+/g,
  'images/placeholders/placeholder-600x400.jpg'
);

// Write the updated content back to index.html
fs.writeFileSync(indexPath, content, 'utf8');

console.log('Image sources have been updated in index.html');

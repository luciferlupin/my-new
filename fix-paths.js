const fs = require('fs');
const path = require('path');

// Read the index.html file
const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace all instances of 'public/css/' with 'css/'
content = content.replace(/public\/css\//g, 'css/');

// Replace all instances of 'public/js/' with 'js/'
content = content.replace(/public\/js\//g, 'js/');

// Write the updated content back to index.html
fs.writeFileSync(indexPath, content, 'utf8');

console.log('File paths have been updated in index.html');

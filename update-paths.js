const fs = require('fs');
const path = require('path');

// Read the index.html file
const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Update CSS paths
content = content.replace(/(<link[^>]+href=["'])(?!https?:\/\/|\/)([^"']+)(["'])/g, (match, p1, p2, p3) => {
  if (p2.startsWith('css/')) {
    return `${p1}public/${p2}${p3}`;
  }
  return match;
});

// Update JS paths
content = content.replace(/(<script[^>]+src=["'])(?!https?:\/\/|\/)([^"']+)(["'])/g, (match, p1, p2, p3) => {
  if (p2.startsWith('js/')) {
    return `${p1}public/${p2}${p3}`;
  }
  return match;
});

// Update image paths
content = content.replace(/(<img[^>]+src=["'])(?!https?:\/\/|\/)([^"']+)(["'])/g, (match, p1, p2, p3) => {
  if (p2.startsWith('images/') || p2.startsWith('img/')) {
    return `${p1}public/${p2}${p3}`;
  }
  return match;
});

// Write the updated content back to index.html
fs.writeFileSync(indexPath, content, 'utf8');

console.log('Updated file paths in index.html');

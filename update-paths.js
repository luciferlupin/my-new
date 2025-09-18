const fs = require('fs');
const path = require('path');

// Read the index.html file
const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Function to update paths in a safe way
const updatePaths = (content, attribute, extensions) => {
  const regex = new RegExp(`(<[^>]+${attribute}=["'])(?!https?:\/\/|\/)([^"']+\.(?:${extensions.join('|')}))(["'])`, 'gi');
  return content.replace(regex, (match, p1, p2, p3) => {
    // If the path already has public/, leave it as is
    if (p2.startsWith('public/')) {
      return match;
    }
    // Otherwise, add public/ if the file exists in the public directory
    const fullPath = path.join(__dirname, 'public', p2);
    if (fs.existsSync(fullPath)) {
      return `${p1}public/${p2}${p3}`;
    }
    return match;
  });
};

// Update CSS paths
content = updatePaths(content, 'href', ['css', 'min\.css']);

// Update JS paths
content = updatePaths(content, 'src', ['js', 'mjs']);

// Update image paths
content = updatePaths(content, 'src', ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']);

// Update background images in style attributes
content = content.replace(/style=["'][^"']*url\(['"]?([^'"\)]+)['"]?\)/g, (match, url) => {
  if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
    const fullPath = path.join(__dirname, 'public', url);
    if (fs.existsSync(fullPath)) {
      return match.replace(url, `public/${url}`);
    }
  }
  return match;
});

// Write the updated content back to index.html
fs.writeFileSync(indexPath, content, 'utf8');

console.log('Updated file paths in index.html');

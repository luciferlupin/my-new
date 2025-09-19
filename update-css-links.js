const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Map of minified CSS files to their non-minified versions
const cssMap = {
    'style.min.css': 'style.css',
    'faq.min.css': 'faq.css',
    'carousel.min.css': 'carousel.css',
    'navbar.min.css': 'navbar.css',
    'animations.min.css': 'animations.css',
    'cta.min.css': 'cta.css'
};

// Replace minified CSS file names with non-minified versions
for (const [minified, original] of Object.entries(cssMap)) {
    const regex = new RegExp(minified.replace(/\./g, '\\.'), 'g');
    content = content.replace(regex, original);
}

// Write the updated content back to index.html
fs.writeFileSync(indexPath, content, 'utf8');

console.log('CSS file references have been updated in index.html');

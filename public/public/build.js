const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const CleanCSS = require('clean-css');

// Ensure clean-css is installed
function ensureDependencies() {
  try {
    require.resolve('clean-css');
  } catch (e) {
    console.log('Installing required dependencies...');
    execSync('npm install clean-css --save-dev', { stdio: 'inherit' });
  }
}

// Minify CSS files
function minifyCSS() {
  const cssDir = path.join(__dirname, 'css');
  const files = fs.readdirSync(cssDir);
  
  // Create minified directory if it doesn't exist
  const minDir = path.join(cssDir, 'minified');
  if (!fs.existsSync(minDir)) {
    fs.mkdirSync(minDir);
  }

  // Minify each CSS file
  files.forEach(file => {
    if (file.endsWith('.css') && !file.endsWith('.min.css')) {
      const filePath = path.join(cssDir, file);
      const minFilePath = path.join(minDir, file.replace(/\.css$/, '.min.css'));
      
      console.log(`Minifying ${file}...`);
      
      const css = fs.readFileSync(filePath, 'utf8');
      const minified = new CleanCSS({
        level: 2,
        format: 'keep-breaks'
      }).minify(css).styles;
      
      fs.writeFileSync(minFilePath, minified);
      console.log(`Created ${path.basename(minFilePath)}`);
    }
  });
}

// Main function
function main() {
  try {
    ensureDependencies();
    minifyCSS();
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build
main();

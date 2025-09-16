const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure output directory exists
const outputDir = path.join(__dirname, 'images', 'optimized');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Supported image extensions
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

// Process a single image
async function optimizeImage(inputPath, outputPath, maxWidth = 2000, quality = 80) {
  try {
    const outputExt = path.extname(outputPath).toLowerCase();
    const isWebP = outputExt === '.webp';
    
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Only resize if image is wider than maxWidth
    const shouldResize = metadata.width > maxWidth;
    
    const pipeline = shouldResize 
      ? image.resize({ width: maxWidth, withoutEnlargement: true })
      : image;
    
    // Apply optimization based on format
    if (isWebP) {
      await pipeline.webp({ quality }).toFile(outputPath);
    } else if (outputExt === '.jpg' || outputExt === '.jpeg') {
      await pipeline.jpeg({ quality, mozjpeg: true }).toFile(outputPath);
    } else if (outputExt === '.png') {
      await pipeline.png({ quality, compressionLevel: 9 }).toFile(outputPath);
    } else {
      // For unsupported formats, just copy the file
      fs.copyFileSync(inputPath, outputPath);
    }
    
    const stats = fs.statSync(inputPath);
    const optimizedStats = fs.statSync(outputPath);
    const savings = ((1 - optimizedStats.size / stats.size) * 100).toFixed(2);
    
    console.log(`Optimized: ${path.basename(inputPath)} -> ${path.basename(outputPath)} (${savings}% smaller)`);
    return true;
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
    return false;
  }
}

// Process all images in a directory
async function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      await processDirectory(fullPath);
    } else {
      const ext = path.extname(file.name).toLowerCase();
      
      if (imageExtensions.includes(ext)) {
        const relativePath = path.relative(path.join(__dirname, 'images'), path.dirname(fullPath));
        const outputDirPath = path.join(outputDir, relativePath);
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDirPath)) {
          fs.mkdirSync(outputDirPath, { recursive: true });
        }
        
        // Convert to WebP for better compression
        const outputFileName = path.basename(file.name, ext) + '.webp';
        const outputPath = path.join(outputDirPath, outputFileName);
        
        // Only process if output doesn't exist or source is newer
        if (!fs.existsSync(outputPath) || 
            fs.statSync(fullPath).mtime > fs.statSync(outputPath).mtime) {
          await optimizeImage(fullPath, outputPath);
        }
      }
    }
  }
}

// Start processing
async function main() {
  try {
    console.log('Optimizing images...');
    await processDirectory(path.join(__dirname, 'images'));
    console.log('Image optimization complete!');
  } catch (error) {
    console.error('Error during image optimization:', error);
    process.exit(1);
  }
}

main();

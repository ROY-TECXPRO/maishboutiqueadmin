import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.join(process.cwd(), 'public/images/hotel');
const outputDir = path.join(process.cwd(), 'public/images/hotel');

async function convertToWebp() {
  if (!fs.existsSync(inputDir)) {
    console.log(`Directory not found: ${inputDir}`);
    return;
  }

  const files = fs.readdirSync(inputDir);
  
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.(jpeg|jpg|png|avif)$/i, '.webp'));

    try {
      if (file.match(/\.(jpeg|jpg|png|avif)$/i)) {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
      }
    } catch (error) {
      console.error(`Error converting ${file}:`, error);
    }
  }
}

convertToWebp();

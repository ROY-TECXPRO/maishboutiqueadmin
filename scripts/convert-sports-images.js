import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.join(process.cwd(), 'public/images/sports');
const outputDir = path.join(process.cwd(), 'public/images/sports');

async function convertToWebp() {
  const subdirs = ['footwear', 'jerseys', 'balls & Tropphies'];

  for (const subdir of subdirs) {
    const inputSubdir = path.join(inputDir, subdir);
    const outputSubdir = path.join(outputDir, subdir);

    if (!fs.existsSync(inputSubdir)) {
      console.log(`Directory not found: ${inputSubdir}`);
      continue;
    }

    const files = fs.readdirSync(inputSubdir);
    
    for (const file of files) {
      const inputPath = path.join(inputSubdir, file);
      const outputPath = path.join(outputSubdir, file.replace(/\.(jpeg|jpg|png)$/i, '.webp'));

      try {
        if (file.match(/\.(jpeg|jpg|png)$/i)) {
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
}

convertToWebp();

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = path.join(process.cwd(), 'public/images');
const outputDir = path.join(process.cwd(), 'public/images');

async function convertLogos() {
  const logos = [
    'Maish-logo-light-mode.svg',
    'maish-logo-dark-mode.svg'
  ];

  for (const logo of logos) {
    const inputPath = path.join(inputDir, logo);
    const outputPath = path.join(outputDir, logo.replace('.svg', '.webp'));

    if (!fs.existsSync(inputPath)) {
      console.log(`Logo not found: ${inputPath}`);
      continue;
    }

    try {
      await sharp(inputPath)
        .resize(200, 60)
        .webp({ quality: 90 })
        .toFile(outputPath);
      console.log(`Converted: ${logo} -> ${logo.replace('.svg', '.webp')}`);
    } catch (error) {
      console.error(`Error converting ${logo}:`, error);
    }
  }
}

convertLogos();

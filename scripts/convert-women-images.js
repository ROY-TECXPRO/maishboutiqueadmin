import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Women wear image rename mappings
const renameMappings = {
  // Dresses
  'African dress.jpg': 'african-print-dress.webp',
  'ankara.jpg': 'ankara-dress.webp',
  'cardigan-sweater.jpeg': 'cardigan-sweater.webp',
  'floral.jpg': 'floral-dress.webp',
  'IMG-20250912-WA0001.jpg': 'elegant-dress-1.webp',
  'IMG-20250912-WA0002.jpg': 'elegant-dress-2.webp',
  'IMG-20250912-WA0003.jpg': 'elegant-dress-3.webp',
  'IMG-20250912-WA0004.jpg': 'elegant-dress-4.webp',
  'IMG-20250912-WA0037.jpg': 'elegant-dress-5.webp',
  'IMG-20250912-WA0039.jpg': 'elegant-dress-6.webp',
  'ry.jpg': 'ruffle-dress.webp',
  'stylish-dress.jpg': 'stylish-dress.webp',
  
  // Pants
  'black bra.jpg': 'black-leggings.webp',
  'comfort.jpg': 'comfort-pants.webp',
  'pink bra.jpg': 'pink-leggings.webp',
  'polystter.jpg': 'polyester-pants.webp',
  'ry.jpg': 'ry-pants.webp',
  'yoga.jpg': 'yoga-pants.webp',
  
  // Skirts
  'IMG-20250912-WA0035.jpg': 'skirt-1.webp',
  'IMG-20250912-WA0039.jpg': 'skirt-2.webp',
  'IMG-20250912-WA0041.jpg': 'skirt-3.webp',
  'IMG-20250912-WA0047.jpg': 'skirt-4.webp',
  'polyster.jpg': 'polyester-skirt.webp',
  'PRICES MAY VARY_ Church Dress for Women Is Made Of….jpg': 'church-skirt-set.webp',
  'ROTITA Lapel Black Long Sleeve Two Piece Suit….jpg': 'black-two-piece.webp',
  
  // Tops
  'boob tops.jpg': 'crop-top.webp',
  'boobtop-longsleeve.jpg': 'long-sleeve-top.webp',
  'candy-scarf.jpeg': 'candy-scarf.webp',
  'CARACTÉRISTIQUES________ Type de tissu _ Fibre….jpg': 'fabric-top.webp',
  'cardigan-sweater.jpeg': 'cardigan-sweater.webp',
  'comfy.jpeg': 'comfy-top.webp',
  'design.jpg': 'design-top.webp',
  'IMG-20250912-WA0012.jpg': 'top-1.webp',
  'IMG-20250912-WA0034.jpg': 'top-2.webp',
  'IMG-20250912-WA0055.jpg': 'top-3.webp',
  'IMG-20250912-WA0057.jpg': 'top-4.webp',
  'IMG-20250912-WA0066.jpg': 'top-5.webp',
  'IMG-20250912-WA0069.jpg': 'top-6.webp',
  'IMG-20250912-WA0070.jpg': 'top-7.webp',
  'ladies casual.jpg': 'casual-top.webp',
  'pink bra.jpg': 'pink-top.webp',
  'red sweater.jpeg': 'red-sweater.webp',
  'scarf.jpeg': 'fashion-scarf.webp',
  'strech.jpg': 'stretch-top.webp',
  'sweater-pink.jpeg': 'pink-sweater.webp',
  'white sweater.jpeg': 'white-sweater.webp',
  'WIDE LEG HIGHWAIST JEANS.jpeg': 'highwaist-jeans.webp',
  'women.jpeg': 'women-top.webp',
};

const womenDirs = [
  'public/images/women/dresses',
  'public/images/women/pants',
  'public/images/women/skirts',
  'public/images/women/tops',
];

async function processWomenImages() {
  console.log('🧵 Processing Women Wear Images...\n');
  
  for (const dir of womenDirs) {
    const category = path.basename(dir);
    console.log(`📂 Processing ${category}...`);
    
    if (!fs.existsSync(dir)) {
      console.log(`   ⚠️  Directory not found: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
      const oldPath = path.join(dir, file);
      
      // Skip directories
      if (fs.statSync(oldPath).isDirectory()) continue;
      
      const newName = renameMappings[file] || file;
      const newPath = path.join(dir, newName);
      
      const ext = path.extname(file).toLowerCase();
      
      try {
        if (ext === '.webp') {
          // Just rename if webp but wrong name
          if (file !== newName) {
            fs.renameSync(oldPath, newPath);
            console.log(`   📝 Renamed: ${file} → ${newName}`);
            count++;
          }
        } else {
          // Convert and rename
          await sharp(oldPath)
            .webp({ quality: 85 })
            .toFile(newPath);
          fs.unlinkSync(oldPath);
          console.log(`   🔄 Converted: ${file} → ${newName}`);
          count++;
        }
      } catch (err) {
        console.error(`   ❌ Error processing ${file}:`, err.message);
      }
    }
    
    console.log(`   ✅ ${count} images processed in ${category}\n`);
  }
  
  console.log('🎉 All women wear images processed!');
}

processWomenImages();

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Workwear image rename mappings
const renameMappings = {
  // Men Workwear
  'AWAKEN Free Ride Inline Skate Black.jpeg': 'inline-skates.webp',
  'boots.jpeg': 'work-boots.webp',
  'Conjunto Uniforme EPI Nr10 Segurança do Trabalho Mecanico Faixa Eletricista Refletiva Construção Obra Serviço.jpeg': 'safety-uniform.webp',
  'Corporate Uniform.jpeg': 'corporate-uniform.webp',
  'gloves.jpeg': 'work-gloves.webp',
  'hard-hat.jpeg': 'safety-helmet.webp',
  'image 1.jpeg': 'workwear-1.webp',
  'image 2.jpeg': 'workwear-2.webp',
  'image 3.jpeg': 'workwear-3.webp',
  'image 4.jpeg': 'workwear-4.webp',
  'IMG-20250927-WA0090.jpg': 'workwear-5.webp',
  'IMG-20250927-WA0092.jpg': 'workwear-6.webp',
  'IMG-20250927-WA0113.jpg': 'workwear-7.webp',
  'IMG-20250927-WA0127.jpg': 'workwear-8.webp',
  'IMG-20250927-WA0131.jpg': 'workwear-9.webp',
  'IMG-20250927-WA0133.jpg': 'workwear-10.webp',
  'IMG-20250927-WA0135.jpg': 'workwear-11.webp',
  'IMG-20250927-WA0141.jpg': 'workwear-12.webp',
  'IMG-20250927-WA0170.jpg': 'workwear-13.webp',
  'INBIKE Breathable Motorcycle Touchscreen Knuckle.jpeg': 'motorcycle-gloves.webp',
  'overalls-bibs.jpeg': 'overalls.webp',
  'safety-boots.jpeg': 'safety-boots.webp',
  'safety-vest.jpeg': 'safety-vest.webp',
  'trail.jpeg': 'trail-shoes.webp',
  'Wearpack Baju Safety Mokoworkwear.jpeg': 'safety-wearpack.webp',
  'wins-bigger.jpeg': 'workwear-14.webp',

  // Women Workwear
  '483404ca-8092-4d82-bff1-c1b727e480f8.jpeg': 'women-workwear-1.webp',
  'IMG-20250927-WA0080.jpg': 'women-workwear-2.webp',
  'IMG-20250927-WA0085.jpg': 'women-workwear-3.webp',
  'IMG-20250927-WA0086.jpg': 'women-workwear-4.webp',
  'IMG-20250927-WA0087.jpg': 'women-workwear-5.webp',
  'IMG-20250927-WA0089.jpg': 'women-workwear-6.webp',
  'IMG-20250927-WA0134.jpg': 'women-workwear-7.webp',
  'wins-bigger.jpeg': 'women-workwear-8.webp',
  'workwear-stock.jpeg': 'women-workwear-9.webp',
};

const workwearDirs = [
  'public/images/work-wear/Men',
  'public/images/work-wear/women',
];

async function processWorkwearImages() {
  console.log('👷 Processing Workwear Images...\n');
  
  let totalCount = 0;
  
  for (const dir of workwearDirs) {
    const category = path.basename(dir);
    console.log(`📂 Processing ${category} workwear...`);
    
    if (!fs.existsSync(dir)) {
      console.log(`   ⚠️  Directory not found: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
      const oldPath = path.join(dir, file);
      
      if (fs.statSync(oldPath).isDirectory()) continue;
      
      const newName = renameMappings[file] || file.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').toLowerCase() + '.webp';
      const newPath = path.join(dir, newName);
      
      const ext = path.extname(file).toLowerCase();
      
      try {
        if (ext === '.webp') {
          if (file !== newName) {
            fs.renameSync(oldPath, newPath);
            console.log(`   📝 Renamed: ${file.substring(0, 40)}... → ${newName}`);
            count++;
          }
        } else {
          await sharp(oldPath)
            .webp({ quality: 85 })
            .toFile(newPath);
          fs.unlinkSync(oldPath);
          console.log(`   🔄 Converted: ${file.substring(0, 40)}... → ${newName}`);
          count++;
        }
      } catch (err) {
        console.error(`   ❌ Error processing ${file}:`, err.message);
      }
    }
    
    console.log(`   ✅ ${count} images processed\n`);
    totalCount += count;
  }
  
  console.log(`🎉 All workwear images processed! Total: ${totalCount}`);
}

processWorkwearImages();

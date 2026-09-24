import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Kids image rename mappings
const renameMappings = {
  // Boys
  'Ankara styles.jpeg': 'ankara-boys.webp',
  'Boys blue page boy suit.jpeg': 'blue-suit-boys.webp',
  'Boys wear.jpeg': 'boys-casual-wear.webp',
  'boys-suit.jpeg': 'boys-formal-suit.webp',
  'Casual.jpeg': 'casual-boys.webp',
  'Happy birthday Zion!.jpeg': 'party-boys.webp',
  'image  6.jpeg': 'boys-image-6.webp',
  'image 1.jpeg': 'boys-image-1.webp',
  'image 2.jpeg': 'boys-image-2.webp',
  'image 3.jpeg': 'boys-image-3.webp',
  'image 4.jpeg': 'boys-image-4.webp',
  'image 5.jpeg': 'boys-image-5.webp',
  'image 7.jpeg': 'boys-image-7.webp',
  'image 8.jpeg': 'boys-image-8.webp',
  'image 9.jpeg': 'boys-image-9.webp',
  'image 10.jpeg': 'boys-image-10.webp',
  'image 11.jpeg': 'boys-image-11.webp',
  'image 12.jpeg': 'boys-image-12.webp',
  'image 13.jpeg': 'boys-image-13.webp',
  'image 14.jpeg': 'boys-image-14.webp',
  'image 18.jpeg': 'boys-image-18.webp',
  'khaki.jpeg': 'khaki-boys.webp',
  'Safari for Children.jpeg': 'safari-boys.webp',
  'Uniq.jpeg': 'unique-boys.webp',

  // Girls
  '495dfab8-725c-4f7e-a7e8-e8cf3e0bf267.jpeg': 'girls-dress-1.webp',
  'Ankara styles.jpeg': 'ankara-girls.webp',
  'dress.jpeg': 'girls-dress.webp',
  'image 8.jpeg': 'girls-image-8.webp',
  'image 10.jpeg': 'girls-image-10.webp',
  'image 13.jpeg': 'girls-image-13.webp',
  'image 14.jpeg': 'girls-image-14.webp',
  'image 15.jpeg': 'girls-image-15.webp',
  'image 16.jpeg': 'girls-image-16.webp',
  'image 17.jpeg': 'girls-image-17.webp',
  'image 19.jpeg': 'girls-image-19.webp',
  'image 20.jpeg': 'girls-image-20.webp',
};

const kidsDirs = [
  'public/images/kids/boys',
  'public/images/kids/girls',
];

async function processKidsImages() {
  console.log('👶 Processing Kids Wear Images...\n');
  
  let totalCount = 0;
  
  for (const dir of kidsDirs) {
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
    
    console.log(`   ✅ ${count} images processed in ${category}\n`);
    totalCount += count;
  }
  
  console.log(`🎉 All kids wear images processed! Total: ${totalCount}`);
}

processKidsImages();

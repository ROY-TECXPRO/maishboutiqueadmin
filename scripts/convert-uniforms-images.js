import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Uniform image rename mappings
const renameMappings = {
  // Boys Uniforms
  'b47230ed-256d-4c51-98b4-e03712e7c993.jpg': 'boys-uniform-1.webp',
  'Baby Cute Cartoon Scout Boy Carrying Backpack Generative By Ai PNG Images _ JPG Free Download - Pikbest.jpeg': 'boys-backpack.webp',
  'Black    Oxford Plain     Men Bags.jpg': 'boys-school-bag.webp',
  'British Style Striped Neck Tie for School Uniform….jpg': 'boys-necktie.webp',
  'Color_Blue _nPattern Type_Colorblock _nPattern….jpg': 'boys-blue-sweater.webp',
  'daa2d33d-4607-49d9-beb9-3146d0c1aabf.jpg': 'boys-uniform-2.webp',
  'Get her set for school with our stylish lace-up….jpg': 'boys-school-shoes.webp',
  'hand-wash.jpg': 'washing-instructions.webp',
  'image 1.jpeg': 'boys-uniform-shirt-1.webp',
  'image 2.jpeg': 'boys-uniform-pants-1.webp',
  'image 3.jpeg': 'boys-uniform-shirt-2.webp',
  'image 4.jpeg': 'boys-uniform-pants-2.webp',
  'image 5.jpeg': 'boys-uniform-full.webp',
  'image 7.jpeg': 'boys-uniform-shirt-3.webp',
  'image 8.jpeg': 'boys-uniform-pants-3.webp',
  'image 9.jpeg': 'boys-uniform-shirt-4.webp',
  'image 10.jpeg': 'boys-uniform-pants-4.webp',
  'image 11.jpeg': 'boys-uniform-shirt-5.webp',
  'image 13.jpeg': 'boys-uniform-pants-5.webp',
  'image 14.jpeg': 'boys-uniform-shirt-6.webp',
  'image 15.jpeg': 'boys-uniform-pants-6.webp',
  'image 16.jpeg': 'boys-uniform-shirt-7.webp',
  'image 18.jpeg': 'boys-uniform-pants-7.webp',
  'image 19.jpeg': 'boys-uniform-shirt-8.webp',
  'image 20.jpeg': 'boys-uniform-pants-8.webp',
  'image 21.jpeg': 'boys-uniform-shirt-9.webp',
  'IMG-20250927-WA0078.jpg': 'boys-uniform-shoes.webp',
  'IMG-20250927-WA0083.jpg': 'boys-uniform-set.webp',
  'PRICES MAY VARY_ V-Neck Sweater Sweatshirt….jpg': 'boys-sweater.webp',
  'School Shoes For Bata _ Shoes For Student Trends….jpg': 'boys-bata-shoes.webp',
  'School Uniform Belts.jpeg': 'boys-belt.webp',
  'Get her set for school with our stylish lace-up….jpg': 'boys-lace-shoes.webp',

  // Girls Uniforms
  '2be2e417-407a-4a51-a2d0-7017df509ce5.jpg': 'girls-uniform-1.webp',
  'Black    Oxford Plain     Men Bags.jpg': 'girls-school-bag.webp',
  'British Style Striped Neck Tie for School Uniform….jpg': 'girls-necktie.webp',
  'Color_Blue _nPattern Type_Colorblock _nPattern….jpg': 'girls-blue-blouse.webp',
  'f7446beb-6359-4e20-8610-6daffde3f580.jpg': 'girls-uniform-2.webp',
  'Get her set for school with our stylish lace-up….jpg': 'girls-uniform-shoes.webp',
  'hand-wash.jpg': 'girls-washing.webp',
  'image 1.jpeg': 'girls-uniform-dress-1.webp',
  'image 2.jpeg': 'girls-uniform-dress-2.webp',
  'image 3.jpeg': 'girls-uniform-dress-3.webp',
  'image 4.jpeg': 'girls-uniform-dress-4.webp',
  'image 5.jpeg': 'girls-uniform-dress-5.webp',
  'image 6.jpeg': 'girls-uniform-blouse-1.webp',
  'image 7.jpeg': 'girls-uniform-skirt-1.webp',
  'image 8.jpeg': 'girls-uniform-dress-6.webp',
  'image 9.jpeg': 'girls-uniform-blouse-2.webp',
  'image 10.jpeg': 'girls-uniform-skirt-2.webp',
  'image 11.jpeg': 'girls-uniform-dress-7.webp',
  'image 13.jpeg': 'girls-uniform-blouse-3.webp',
  'image 14.jpeg': 'girls-uniform-skirt-3.webp',
  'image 15.jpeg': 'girls-uniform-dress-8.webp',
  'image 16.jpeg': 'girls-uniform-blouse-4.webp',
  'image 17.jpeg': 'girls-uniform-skirt-4.webp',
  'image 18.jpeg': 'girls-uniform-dress-9.webp',
  'image 19.jpeg': 'girls-uniform-blouse-5.webp',
  'image 20.jpeg': 'girls-uniform-skirt-5.webp',
  'image 21.jpeg': 'girls-uniform-dress-10.webp',
  'image 22.jpeg': 'girls-uniform-blouse-6.webp',
  'image 23.jpeg': 'girls-uniform-skirt-6.webp',
  'PRICES MAY VARY_ Introducing our latest innovation….jpg': 'girls-cardigan.webp',
  'School Shoes For Bata _ Shoes For Student Trends….jpg': 'girls-bata-shoes.webp',
  'School Uniform Belts.jpeg': 'girls-belt.webp',

  // School Sports
  'IMG-20250927-WA0101.jpg': 'school-sports-1.webp',
  'IMG-20250927-WA0111.jpg': 'school-sports-2.webp',
  'IMG-20250927-WA0121.jpg': 'school-sports-3.webp',
  'IMG-20250927-WA0124.jpg': 'school-sports-4.webp',
  'IMG-20250927-WA0130.jpg': 'school-sports-5.webp',
  'IMG-20250927-WA0132.jpg': 'school-sports-6.webp',
  'IMG-20250927-WA0138.jpg': 'school-sports-7.webp',
  'IMG-20250927-WA0143.jpg': 'school-sports-8.webp',
  'IMG-20250927-WA0146.jpg': 'school-sports-9.webp',
  'IMG-20250927-WA0172.jpg': 'school-sports-10.webp',

  // Scouts
  'Baby Cute Cartoon Scout Boy Carrying Backpack Generative By Ai PNG Images _ JPG Free Download - Pikbest.jpeg': 'scout-backpack.webp',
  'Brownie Uniform mid 50s.jpeg': 'scout-uniform.webp',
  'hand-wash.jpg': 'scout-washing.webp',
  'image 1.jpeg': 'scout-shirt.webp',
  'images (1).jpeg': 'scout-shorts.webp',
  'images (2).jpeg': 'scout-hat.webp',
  'images (3).jpeg': 'scout-scarf.webp',
  'images (4).jpeg': 'scout-badge.webp',
  'images (5).jpeg': 'scout-full.webp',
  'images (6).jpeg': 'scout-uniform-set.webp',
  "Kenya's new Brownie uniform from 2012….jpeg": 'brownie-uniform.webp',
};

const uniformDirs = [
  'public/images/uniforms/boys',
  'public/images/uniforms/girls',
  'public/images/uniforms/School sports',
  'public/images/uniforms/scouts',
];

async function processUniformImages() {
  console.log('🎓 Processing Uniform Images...\n');
  
  let totalCount = 0;
  
  for (const dir of uniformDirs) {
    const category = path.basename(dir);
    console.log(`📂 Processing ${category} uniforms...`);
    
    if (!fs.existsSync(dir)) {
      console.log(`   ⚠️  Directory not found: ${dir}`);
      continue;
    }
    
    const files = fs.readdirSync(dir);
    let count = 0;
    
    for (const file of files) {
      const oldPath = path.join(dir, file);
      
      if (fs.statSync(oldPath).isDirectory()) continue;
      
      const newName = renameMappings[file] || file
        .replace(/[^a-zA-Z0-9\s.-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()
        .substring(0, 50) + '.webp';
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
  
  console.log(`🎉 All uniform images processed! Total: ${totalCount}`);
}

processUniformImages();

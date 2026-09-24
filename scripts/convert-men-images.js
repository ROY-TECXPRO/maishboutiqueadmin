import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Men wear image rename mappings
const renameMappings = {
  // Shirts
  '_DSC3410.jpg': 'formal-shirt-1.webp',
  '_DSC3412.jpg': 'formal-shirt-2.webp',
  '_DSC3438.jpg': 'formal-shirt-3.webp',
  '_DSC3463.jpg': 'formal-shirt-4.webp',
  'CARACTÉRISTIQUES     Scène applicable….jpg': 'casual-shirt-1.webp',
  'CARACTÉRISTIQUES________ Type de tissu _ Fibre….jpg': 'formal-shirt-fabric.webp',
  'Chemise à manches courtes simple et mode pour….jpg': 'short-sleeve-shirt.webp',
  'Christopher Noir™ - The Original_ Where Culture….jpg': 'black-formal-shirt.webp',
  'Description_   Formal Men\'s Suits 2 Piece Slim Fit….jpg': 'slim-fit-suit.webp',
  'Elegant Handmade Navy Blue Three Piece Coat Pant….jpg': 'navy-three-piece-suit.webp',
  'Elegantes Herren Anzug Set Königsblau….jpg': 'elegant-blue-suit.webp',
  'Elevate Your Casual Look with Our Stylish Long….jpg': 'casual-long-sleeve.webp',
  'f023df73-c5fc-4306-a836-c9a5b74675c3.jpg': 'formal-shirt-5.webp',
  'Gothic Formal Outfit.jpeg': 'gothic-formal.webp',
  'Here\'s a men\'s outfit perfect for all your outings….jpg': 'casual-outfit.webp',
  'Herren Hochzeit Anzüge Suits Marineblau Armeegrün….jpg': 'wedding-suit.webp',
  'IMG-20250912-WA0005.jpg': 'mens-shirt-1.webp',
  'IMG-20250912-WA0006.jpg': 'mens-shirt-2.webp',
  'IMG-20250912-WA0007.jpg': 'mens-shirt-3.webp',
  'IMG-20250912-WA0008.jpg': 'mens-shirt-4.webp',
  'IMG-20250912-WA0009.jpg': 'mens-shirt-5.webp',
  'IMG-20250912-WA0010.jpg': 'mens-shirt-6.webp',
  'IMG-20250912-WA0011.jpg': 'mens-shirt-7.webp',
  'IMG-20250912-WA0023.jpg': 'mens-shirt-8.webp',
  'IMG-20250912-WA0024.jpg': 'mens-shirt-9.webp',
  'IMG-20250912-WA0032.jpg': 'mens-shirt-10.webp',
  'IMG-20250912-WA0033.jpg': 'mens-shirt-11.webp',
  'IMG-20250912-WA0036.jpg': 'mens-shirt-12.webp',
  'IMG-20250912-WA0048.jpg': 'mens-shirt-13.webp',
  'IMG-20250912-WA0049.jpg': 'mens-shirt-14.webp',
  'IMG-20250912-WA0050.jpg': 'mens-shirt-15.webp',
  'IMG-20250912-WA0051.jpg': 'mens-shirt-16.webp',
  'IMG-20250912-WA0052.jpg': 'mens-shirt-17.webp',
  'IMG-20250912-WA0053.jpg': 'mens-shirt-18.webp',
  'IMG-20250912-WA0054.jpg': 'mens-shirt-19.webp',
  'IMG-20250912-WA0097.jpg': 'mens-shirt-20.webp',
  'IMG-20250912-WA0098.jpg': 'mens-shirt-21.webp',
  'Made from a premium blend of wool this Safari suit….jpg': 'safari-suit.webp',
  'Material_ 95% Polyester, 5% Spandex Neckline_Shirt….jpg': 'polo-shirt.webp',
  'men-kaunda.jpeg': 'kaunda-suit.webp',
  'Men\'s Fashion Casual Comfortable Loose Ribbed Fabric Short-sleeved Polo Shirt Red-M.jpeg': 'red-polo-shirt.webp',
  'mens.jpeg': 'mens-casual-shirt.webp',
  'PRICES MAY VARY_ 【2 PIECE MENS SUIT FABRIC】This….jpg': 'two-piece-suit.webp',
  'PRICES MAY VARY_ 【Materials】_The jogging suits….jpg': 'jogging-suit.webp',
  'PRICES MAY VARY_ Comfortable Fabrics_Men Athletic….jpg': 'athletic-wear.webp',
  'PRICES MAY VARY_ Service --- If you have any….jpg': 'casual-wear.webp',
  'Product information_ Pattern_ Plaid Color_ green….jpg': 'plaid-shirt.webp',
  'Revamp your sportswear collection with this….jpg': 'sportswear.webp',
  'This short-sleeve tops is made with comfortable….jpg': 'short-sleeve-top.webp',
  'Wale African men clothing_embroidered suit_wedding suit_senator suit_groomsmen suit_handmade clothing_2 piece set_Nigerian men outfit_Kaftan.jpeg': 'african-suit.webp',
  'بدلة رجالية عادية من قميص كم طويل بسحاب أمامي….jpg': 'arabic-suit.webp',

  // Trousers
  '7e3dcffe-8cbf-4724-966f-5a2e6762c114.jpg': 'classic-trousers.webp',
  '2025 Spring Men\'s Jeans High Quality Classic Style….jpg': 'spring-jeans.webp',
  'Boyfriend Style Men\'s Striped Patchwork Zipper….jpg': 'striped-trousers.webp',
  'IMG-20250912-WA0015.jpg': 'mens-trousers-1.webp',
  'IMG-20250912-WA0016.jpg': 'mens-trousers-2.webp',
  'IMG-20250912-WA0017.jpg': 'mens-trousers-3.webp',
  'IMG-20250912-WA0018.jpg': 'mens-trousers-4.webp',
  'IMG-20250912-WA0062.jpg': 'mens-trousers-5.webp',
  'IMG-20250912-WA0063.jpg': 'mens-trousers-6.webp',
  'Product information_ Color_ gray, black, blue….jpg': 'color-options-trousers.webp',
  'Slim-fit trousers in melange virgin wool_ Elegant….jpg': 'slim-fit-wool.webp',
  'Slim-fit trousers in seersucker_ With front pleats….jpg': 'seersucker-trousers.webp',
  'SPECIFICATIONS Plus Size 40 42 44 Autumn Loose….jpg': 'plus-size-trousers.webp',
};

const menDirs = [
  'public/images/men/shirts',
  'public/images/men/trousers',
];

async function processMenImages() {
  console.log('👔 Processing Men Wear Images...\n');
  
  let totalCount = 0;
  
  for (const dir of menDirs) {
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
  
  console.log(`🎉 All men wear images processed! Total: ${totalCount}`);
}

processMenImages();

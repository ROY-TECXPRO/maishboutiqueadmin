import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const jewelryDir = 'public/images/accessories/jewelry';

// File mapping for renaming
const renameMap = {
  // IMG files
  'IMG-20250912-WA0020.jpg': 'seiko-watch.webp',
  'IMG-20250912-WA0021.jpg': 'womens-watch.webp',
  'IMG-20250912-WA0022.jpg': 'unisex-watch.webp',
  
  // Non-descriptive names
  'caps.webp': 'mens-cap.webp',
  'casualbelt.webp': 'mens-casual-belt.webp',
  'casualhtas.webp': 'mens-hat.webp',
  'chain.webp': 'gold-chain.webp',
  'clerkhats.webp': 'clerks-hat.webp',
  'kenyanflag.webp': 'kenyan-flag-pin.webp',
  'leather-accessory.jpg': 'leather-bracelet.webp',
  'mavins.webp': 'womens-clutch-bag.webp',
  'mens-belt.jpg': 'mens-leather-belt.webp',
  'mens-comfort.jpg': 'mens-comfort-sandals.webp',
  'mens-glasses.jpg': 'mens-eyeglasses.webp',
  'necklace.jpg': 'womens-necklace.webp',
  'rope-chain.jpg': 'rope-chain-necklace.webp',
  
  // Already good names - keep as is
  'cuban-necklace.webp': 'cuban-necklace.webp',
  'neutral-rings.jpg': 'neutral-rings.webp',
  'seiko-watch.jpg': 'seiko-watch.webp',
  'signet-ring.webp': 'signet-ring.webp',
  'silverwatch.webp': 'silver-watch.webp',
  'unisex-watch.jpg': 'unisex-watch.webp',
  'womens-watch.jpeg': 'womens-watch.webp',
  
  // Complex names to simplify
  'jewellery piece(Cuban bracelet).jpeg': 'cuban-bracelet.webp',
  'jewellery-set.jpeg': 'jewelry-set.webp',
};

async function processImages() {
  const files = fs.readdirSync(jewelryDir);
  
  for (const file of files) {
    const oldPath = path.join(jewelryDir, file);
    const newName = renameMap[file];
    
    if (!newName) {
      console.log(`⚠️  Skipping: ${file} (no mapping)`);
      continue;
    }
    
    const newPath = path.join(jewelryDir, newName);
    
    try {
      // Check if file needs conversion (not already webp)
      const ext = path.extname(file).toLowerCase();
      
      if (ext === '.webp') {
        // Just rename
        if (file !== newName) {
          fs.renameSync(oldPath, newPath);
          console.log(`📝 Renamed: ${file} → ${newName}`);
        } else {
          console.log(`✓ Kept: ${file}`);
        }
      } else {
        // Convert and rename
        await sharp(oldPath)
          .webp({ quality: 85 })
          .toFile(newPath);
        fs.unlinkSync(oldPath);
        console.log(`🔄 Converted & renamed: ${file} → ${newName}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }
  
  console.log('\n✅ All images processed!');
}

processImages();

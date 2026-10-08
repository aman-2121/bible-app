const fs = require('fs');
const path = require('path');

const src = 'C:/Users/markos/.gemini/antigravity-ide/brain/cef9bdc0-76b0-4b6a-8e68-dbd4e3dad3ec/ethiopian_diamond_cross_1791362258451.jpg';
const assetsDir = path.join(__dirname, '../assets/images');

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(assetsDir, 'orthodox_cross.png'));
    fs.copyFileSync(src, path.join(assetsDir, 'orthodox_cross.jpg'));
    fs.copyFileSync(src, path.join(assetsDir, 'favicon.png'));
    console.log('Ethiopian Orthodox cross assets copied successfully!');
  } else {
    console.warn('Source image not found at', src);
  }
} catch (e) {
  console.error('Error copying cross:', e);
}

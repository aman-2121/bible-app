import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const src = 'C:/Users/markos/.gemini/antigravity-ide/brain/cef9bdc0-76b0-4b6a-8e68-dbd4e3dad3ec/ethiopian_diamond_cross_1791362258451.jpg';
    const assetsDir = path.resolve(process.cwd(), 'assets/images');

    if (fs.existsSync(src)) {
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }
      fs.copyFileSync(src, path.join(assetsDir, 'orthodox_cross.png'));
      fs.copyFileSync(src, path.join(assetsDir, 'orthodox_cross.jpg'));
      fs.copyFileSync(src, path.join(assetsDir, 'favicon.png'));

      return Response.json({ success: true, message: 'Assets copied successfully' });
    }
    return Response.json({ success: false, message: 'Source image not found' });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message });
  }
}

export async function POST() {
  return GET();
}

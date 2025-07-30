import multer from 'multer';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Process and save uploaded image
export async function saveUploadedImage(
  file: Express.Multer.File,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<string> {
  const {
    width = 1024,
    height = 1024,
    quality = 85
  } = options;

  // Generate unique filename
  const filename = `${nanoid()}.jpg`;
  const filepath = path.join(uploadsDir, filename);

  // Process image with sharp
  await sharp(file.buffer)
    .resize(width, height, { 
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality })
    .toFile(filepath);

  // Return public URL
  return `/uploads/${filename}`;
}

// Delete uploaded file
export async function deleteUploadedFile(filepath: string): Promise<void> {
  try {
    // Extract filename from URL path
    const filename = path.basename(filepath);
    const fullPath = path.join(uploadsDir, filename);
    await fs.unlink(fullPath);
  } catch (error) {
    // File doesn't exist or already deleted
    console.warn('Failed to delete file:', filepath);
  }
}
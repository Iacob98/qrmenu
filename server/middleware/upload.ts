import multer from 'multer';
import sharp from 'sharp';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';

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

// Download and save image from URL (for AI generated images)
export async function saveImageFromURL(
  imageUrl: string,
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

  try {
    console.log('[Image Download] Fetching image from:', imageUrl);
    
    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate unique filename
    const filename = `${nanoid()}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    // Process image with sharp
    await sharp(buffer)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toFile(filepath);

    const localUrl = `/uploads/${filename}`;
    console.log('[Image Download] Saved to:', localUrl);
    
    // Return public URL
    return localUrl;
  } catch (error: any) {
    console.error('[Image Download] Error:', error);
    throw new Error(`Failed to save image from URL: ${error.message}`);
  }
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
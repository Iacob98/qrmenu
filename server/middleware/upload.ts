import multer from 'multer';
import { storageService, UploadOptions } from '../services/storageService';
import { STORAGE_BUCKETS } from '../supabase';

// Configure multer for file uploads (memory storage)
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
  options: UploadOptions = {},
  bucket: string = STORAGE_BUCKETS.MENU_IMAGES
): Promise<string> {
  const result = await storageService.uploadImage(file.buffer, bucket, options);
  return result.url;
}

// Download and save image from URL (for AI generated images)
export async function saveImageFromURL(
  imageUrl: string,
  options: UploadOptions = {},
  bucket: string = STORAGE_BUCKETS.MENU_IMAGES
): Promise<string> {
  const result = await storageService.uploadFromUrl(imageUrl, bucket, options);
  return result.url;
}

// Delete uploaded file
export async function deleteUploadedFile(filepath: string): Promise<void> {
  await storageService.deleteFile(filepath);
}

// Get signed upload URL for direct uploads
export async function getSignedUploadUrl(bucket: string, filename?: string) {
  return storageService.getSignedUploadUrl(bucket, filename);
}

import { supabaseAdmin, STORAGE_BUCKETS, getPublicUrl, isSupabaseConfigured } from '../supabase';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import fetch from 'node-fetch';

// Fallback to local storage if Supabase is not configured
const LOCAL_UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure local uploads directory exists
fs.mkdir(LOCAL_UPLOADS_DIR, { recursive: true }).catch(() => {});

export interface UploadOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Storage service for file uploads
 * Uses Supabase Storage when configured, falls back to local filesystem
 */
export class StorageService {
  private useSupabase: boolean;

  constructor() {
    this.useSupabase = isSupabaseConfigured();
    if (!this.useSupabase) {
      console.log('[Storage] Using local filesystem storage (Supabase not configured)');
    } else {
      console.log('[Storage] Using Supabase Storage');
    }
  }

  /**
   * Upload an image file (from buffer)
   */
  async uploadImage(
    buffer: Buffer,
    bucket: string = STORAGE_BUCKETS.MENU_IMAGES,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const { width = 1024, height = 1024, quality = 85 } = options;

    // Process image with sharp
    const processedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toBuffer();

    const filename = `${nanoid()}.jpg`;

    if (this.useSupabase && supabaseAdmin) {
      return this.uploadToSupabase(processedBuffer, bucket, filename);
    } else {
      return this.uploadToLocal(processedBuffer, filename);
    }
  }

  /**
   * Upload a file from URL (for AI generated images)
   */
  async uploadFromUrl(
    imageUrl: string,
    bucket: string = STORAGE_BUCKETS.MENU_IMAGES,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const { width = 1024, height = 1024, quality = 85 } = options;

    console.log('[Storage] Downloading image from:', imageUrl);

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return this.uploadImage(buffer, bucket, { width, height, quality });
  }

  /**
   * Delete a file
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (this.useSupabase && supabaseAdmin) {
      // Extract bucket and path from URL
      const match = fileUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
      if (match) {
        const [, bucket, filePath] = match;
        const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);
        if (error) {
          console.warn('[Storage] Failed to delete from Supabase:', error.message);
        }
      }
    } else {
      // Local deletion
      try {
        const filename = path.basename(fileUrl);
        const fullPath = path.join(LOCAL_UPLOADS_DIR, filename);
        await fs.unlink(fullPath);
      } catch (error) {
        console.warn('[Storage] Failed to delete local file:', fileUrl);
      }
    }
  }

  /**
   * Get a signed upload URL for direct client uploads
   */
  async getSignedUploadUrl(bucket: string, filename?: string): Promise<{ uploadUrl: string; path: string }> {
    if (!this.useSupabase || !supabaseAdmin) {
      throw new Error('Signed URLs require Supabase configuration');
    }

    const filePath = filename || `${nanoid()}.jpg`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return {
      uploadUrl: data.signedUrl,
      path: filePath
    };
  }

  // Private methods

  private async uploadToSupabase(buffer: Buffer, bucket: string, filename: string): Promise<UploadResult> {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized');
    }

    const filePath = `uploads/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    const url = getPublicUrl(bucket, filePath);
    console.log('[Storage] Uploaded to Supabase:', url);

    return { url, path: filePath };
  }

  private async uploadToLocal(buffer: Buffer, filename: string): Promise<UploadResult> {
    const filepath = path.join(LOCAL_UPLOADS_DIR, filename);
    await fs.writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    console.log('[Storage] Saved locally:', url);

    return { url, path: filename };
  }
}

// Singleton instance
export const storageService = new StorageService();

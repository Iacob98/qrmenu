import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('SUPABASE_URL is not set. Supabase features will be disabled.');
}

// Admin client with service role key (for server-side operations)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Public client with anon key (for client-safe operations)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage bucket names
export const STORAGE_BUCKETS = {
  MENU_IMAGES: 'menu-images',
  LOGOS: 'logos',
  BANNERS: 'banners',
  FEEDBACK: 'feedback',
} as const;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseServiceKey);
}

// Get public URL for a file in storage
export function getPublicUrl(bucket: string, path: string): string {
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not configured');
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

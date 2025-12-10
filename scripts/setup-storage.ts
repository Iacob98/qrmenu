// Script to create Supabase storage buckets
// Run with: npx tsx scripts/setup-storage.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:8000';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const BUCKETS = [
  { name: 'menu-images', public: true },
  { name: 'logos', public: true },
  { name: 'banners', public: true },
  { name: 'feedback', public: false },
];

async function setupStorage() {
  console.log('Setting up Supabase storage buckets...\n');

  for (const bucket of BUCKETS) {
    console.log(`Creating bucket: ${bucket.name}`);

    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ✓ Bucket "${bucket.name}" already exists`);
      } else {
        console.error(`  ✗ Error creating bucket "${bucket.name}":`, error.message);
      }
    } else {
      console.log(`  ✓ Bucket "${bucket.name}" created successfully`);
    }
  }

  console.log('\nStorage setup complete!');
}

setupStorage().catch(console.error);

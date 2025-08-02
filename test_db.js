// Simple database connection test
import { db } from './server/db.js';
import { users } from './shared/schema.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.select().from(users).limit(1);
    console.log('Database connection successful!');
    console.log('Users found:', result.length);
    
    // Try to find the admin user
    const adminUser = await db.select().from(users).where(eq(users.email, 'admin123@gmail.com')).limit(1);
    console.log('Admin user exists:', adminUser.length > 0);
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
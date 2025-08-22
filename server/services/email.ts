import { randomBytes } from 'crypto';

interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

class MockEmailService implements EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // In a real application, you would use a service like SendGrid, AWS SES, or Nodemailer
    console.log(`📧 Email verification sent to: ${email}`);
    console.log(`🔗 Verification link: ${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`);
    console.log(`⚠️  This is a mock service. In production, implement real email sending.`);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log(`📧 Password reset email sent to: ${email}`);
    console.log(`🔗 Reset link: ${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/reset-password?token=${token}`);
    console.log(`⚠️  This is a mock service. In production, implement real email sending.`);
  }
}

export const emailService: EmailService = new MockEmailService();

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // Token expires in 24 hours
  return expiry;
}
import { randomBytes } from 'crypto';
import sgMail from '@sendgrid/mail';

interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

class SendGridEmailService implements EmailService {
  constructor() {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid email service initialized');
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl && process.env.NODE_ENV === 'production') {
      console.warn('[Email] BASE_URL not set - email links may not work correctly in production');
    }

    const verificationUrl = `${baseUrl || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@qrmenu.com', // Use verified sender
      subject: 'Подтвердите ваш email адрес - DEMO Restaurant',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Подтверждение email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin: 0 0 10px 0;">🍽️ DEMO Restaurant</h1>
                <p style="color: #6b7280; margin: 0;">Платформа для управления меню</p>
              </div>
              
              <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Подтвердите ваш email адрес</h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Добро пожаловать в нашу платформу! Для завершения регистрации, пожалуйста, подтвердите ваш email адрес.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Подтвердить email
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
                <a href="${verificationUrl}" style="color: #10b981; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                Эта ссылка действительна в течение 24 часов. Если вы не регистрировались на нашей платформе, просто проигнорируйте это письмо.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Подтвердите ваш email адрес
        
        Добро пожаловать в DEMO Restaurant! Для завершения регистрации, перейдите по ссылке:
        
        ${verificationUrl}
        
        Эта ссылка действительна в течение 24 часов.
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Verification email sent successfully to: ${email}`);
    } catch (error: any) {
      console.error('SendGrid error:', error.response?.body || error.message);
      if (error.response?.body?.errors?.[0]?.message?.includes('verified Sender Identity')) {
        console.log('\n⚠️  SENDGRID SETUP REQUIRED:');
        console.log('1. Go to https://app.sendgrid.com/settings/sender_auth');
        console.log('2. Click "Create a Single Sender"');
        console.log('3. Use your real email address as the sender');
        console.log('4. Verify the email address');
        console.log('5. Update the "from" field in email service to your verified email\n');
      }
      throw new Error(`SendGrid setup required: Please verify your sender identity in SendGrid dashboard`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl && process.env.NODE_ENV === 'production') {
      console.warn('[Email] BASE_URL not set - password reset links may not work correctly in production');
    }

    const resetUrl = `${baseUrl || 'http://localhost:5000'}/api/auth/reset-password?token=${token}`;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@qrmenu.com',
      subject: 'Сброс пароля - DEMO Restaurant',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Сброс пароля</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1f2937; font-size: 28px; margin: 0 0 10px 0;">🍽️ DEMO Restaurant</h1>
                <p style="color: #6b7280; margin: 0;">Платформа для управления меню</p>
              </div>
              
              <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Сброс пароля</h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Вы запросили сброс пароля для вашего аккаунта. Нажмите кнопку ниже, чтобы создать новый пароль.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Сбросить пароль
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
                <a href="${resetUrl}" style="color: #10b981; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                Эта ссылка действительна в течение 24 часов. Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Сброс пароля
        
        Вы запросили сброс пароля для DEMO Restaurant. Перейдите по ссылке:
        
        ${resetUrl}
        
        Эта ссылка действительна в течение 24 часов.
      `
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Password reset email sent successfully to: ${email}`);
    } catch (error: any) {
      console.error('SendGrid error:', error.response?.body || error.message);
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
}

class MockEmailService implements EmailService {
  async sendVerificationEmail(email: string, _token: string): Promise<void> {
    console.warn(`[Email] SENDGRID_API_KEY not set — verification email to ${email} NOT sent`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error("Email service not configured");
    }
  }

  async sendPasswordResetEmail(email: string, _token: string): Promise<void> {
    console.warn(`[Email] SENDGRID_API_KEY not set — password reset email to ${email} NOT sent`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error("Email service not configured");
    }
  }
}

export const emailService: EmailService = process.env.SENDGRID_API_KEY
  ? new SendGridEmailService()
  : new MockEmailService();

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // Token expires in 24 hours
  return expiry;
}
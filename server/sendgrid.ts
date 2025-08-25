import { MailService } from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  // Validate required email field
  if (!params.from || !params.to) {
    console.error('SendGrid: Missing required email addresses');
    return false;
  }
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

interface FeedbackEmailData {
  type: string;
  title: string;
  description: string;
  email?: string;
  photos: string[];
  browserInfo?: any;
  userId?: string;
}

export async function sendFeedbackEmail(
  data: FeedbackEmailData,
  toEmail: string
): Promise<boolean> {
  const typeLabels: Record<string, string> = {
    bug: "🐛 Bug Report",
    suggestion: "💡 Suggestion", 
    feature_request: "⭐ Feature Request"
  };

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">${typeLabels[data.type] || "Feedback"}</h2>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #374151;">${data.title}</h3>
        <p style="color: #6b7280; white-space: pre-wrap;">${data.description}</p>
        
        ${data.email ? `<p><strong>Contact:</strong> ${data.email}</p>` : ''}
        ${data.userId ? `<p><strong>User ID:</strong> ${data.userId}</p>` : ''}
      </div>
      
      ${data.photos.length > 0 ? `
        <div style="margin: 20px 0;">
          <h4>Screenshots/Photos:</h4>
          ${data.photos.map((photo, index) => 
            `<p><a href="${photo}" style="color: #3b82f6;">Photo ${index + 1}</a></p>`
          ).join('')}
        </div>
      ` : ''}
      
      ${data.browserInfo ? `
        <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 6px;">
          <h4>Browser Info:</h4>
          <pre style="font-size: 12px; color: #6b7280;">${JSON.stringify(data.browserInfo, null, 2)}</pre>
        </div>
      ` : ''}
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 14px;">
        This feedback was sent from QRMenu Dashboard
      </p>
    </div>
  `;

  const emailText = `
${typeLabels[data.type] || "Feedback"}: ${data.title}

${data.description}

${data.email ? `Contact: ${data.email}` : ''}
${data.userId ? `User ID: ${data.userId}` : ''}
${data.photos.length > 0 ? `\nPhotos: ${data.photos.join(', ')}` : ''}
${data.browserInfo ? `\nBrowser: ${JSON.stringify(data.browserInfo)}` : ''}
`;

  return sendEmail({
    to: toEmail,
    from: "feedback@example.com", // This needs to be a verified sender address
    subject: `QRMenu Feedback: ${data.title}`,
    text: emailText,
    html: emailHtml,
  });
}
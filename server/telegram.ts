import { fetchWithRetry } from "./utils/retry";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  console.warn("TELEGRAM_BOT_TOKEN environment variable not set");
}

if (!TELEGRAM_CHAT_ID) {
  console.warn("TELEGRAM_CHAT_ID environment variable not set");
}

interface FeedbackData {
  type: "bug" | "suggestion" | "feature_request";
  title: string;
  description: string;
  email?: string;
  photos: string[];
  browserInfo?: any;
  userId?: string;
}

// Send text message to Telegram
async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram credentials not configured");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML',
      }),
    }, {
      maxRetries: 3,
      onRetry: (error, attempt) => {
        console.warn(`[Telegram] Retry ${attempt} for sendMessage:`, error instanceof Error ? error.message : error);
      },
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Telegram message error:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram message error:', error);
    return false;
  }
}

// Send photo to Telegram
async function sendTelegramPhoto(photoUrl: string, caption?: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error("Telegram credentials not configured");
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo: photoUrl,
        caption: caption || '',
      }),
    }, {
      maxRetries: 3,
      onRetry: (error, attempt) => {
        console.warn(`[Telegram] Retry ${attempt} for sendPhoto:`, error instanceof Error ? error.message : error);
      },
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Telegram photo error:', result);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram photo error:', error);
    return false;
  }
}

// Send feedback notification to Telegram
export async function sendFeedbackToTelegram(data: FeedbackData): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("[Telegram] Credentials not configured, skipping notification");
    return false;
  }

  const typeEmojis = {
    bug: "🐛",
    suggestion: "💡", 
    feature_request: "⭐"
  };

  const typeLabels = {
    bug: "Bug Report",
    suggestion: "Suggestion",
    feature_request: "Feature Request"
  };

  // Main message text
  const messageText = `
${typeEmojis[data.type]} <b>${typeLabels[data.type]}</b>

<b>Title:</b> ${data.title}

<b>Description:</b>
${data.description}

${data.email ? `<b>Contact:</b> ${data.email}` : ''}
${data.userId ? `<b>User ID:</b> ${data.userId}` : ''}
${data.photos.length > 0 ? `<b>Photos:</b> ${data.photos.length} attached` : ''}

${data.browserInfo ? `<b>Browser Info:</b> ${JSON.stringify(data.browserInfo, null, 2)}` : ''}

📱 <i>Sent from QRMenu Dashboard</i>
`.trim();

  try {
    // Send main message
    const messageSent = await sendTelegramMessage(messageText);
    if (!messageSent) {
      return false;
    }

    // Send photos if any
    if (data.photos.length > 0) {
      console.log(`[Telegram] Sending ${data.photos.length} photos...`);
      console.log(`[Telegram] Photo URLs:`, data.photos);
      
      for (let i = 0; i < data.photos.length; i++) {
        let photoUrl = data.photos[i];
        
        // Convert relative URLs to full URLs if needed
        if (photoUrl.startsWith('/')) {
          const baseUrl = process.env.BASE_URL;
          if (!baseUrl && process.env.NODE_ENV === 'production') {
            console.warn('[Telegram] BASE_URL not set - photo URLs may not resolve correctly in production');
          }
          photoUrl = `${baseUrl || 'http://localhost:5000'}${photoUrl}`;
        }
        
        const caption = `Photo ${i + 1}/${data.photos.length}`;
        
        console.log(`[Telegram] Attempting to send photo ${i + 1}: ${photoUrl}`);
        const photoSent = await sendTelegramPhoto(photoUrl, caption);
        if (!photoSent) {
          console.error(`[Telegram] Failed to send photo ${i + 1}: ${photoUrl}`);
        } else {
          console.log(`[Telegram] Photo ${i + 1} sent successfully`);
        }
        
        // Small delay between photos to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log("[Telegram] Feedback notification sent successfully");
    return true;

  } catch (error) {
    console.error("[Telegram] Error sending feedback:", error);
    return false;
  }
}

// Test Telegram connection
export async function testTelegramConnection(): Promise<{ success: boolean; message: string }> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return {
      success: false,
      message: "Telegram credentials not configured (TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing)"
    };
  }

  try {
    const testMessage = "🤖 QRMenu Telegram integration test - connection successful!";
    const sent = await sendTelegramMessage(testMessage);
    
    return {
      success: sent,
      message: sent ? "Test message sent successfully!" : "Failed to send test message"
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error}`
    };
  }
}
// Helper function for error handling
const handleError = (error: unknown): string => {
  return error instanceof Error ? error.message : "An unexpected error occurred";
};

export interface QRCodeData {
  url: string;
  qrCodeSVG: string;
  qrCodePNG: string;
}

export class QRService {
  async generateQRCode(url: string): Promise<QRCodeData> {
    try {
      // Using a simple QR code generation approach
      // In production, you might want to use a dedicated QR library
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
      
      const qrCodeSVG = this.generateQRSVG(url);
      
      return {
        url,
        qrCodeSVG,
        qrCodePNG: qrApiUrl,
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${handleError(error)}`);
    }
  }

  private generateQRSVG(url: string): string {
    // Simple SVG QR code placeholder
    // In production, use a proper QR code library
    return `
      <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" fill="white"/>
        <rect x="20" y="20" width="260" height="260" fill="black"/>
        <rect x="40" y="40" width="220" height="220" fill="white"/>
        <text x="150" y="150" text-anchor="middle" font-family="Arial" font-size="12" fill="black">QR</text>
        <text x="150" y="170" text-anchor="middle" font-family="Arial" font-size="8" fill="black">${url.slice(0, 30)}...</text>
      </svg>
    `.trim();
  }

  generateRestaurantQR(restaurantSlug: string): Promise<QRCodeData> {
    const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
    const url = `https://${baseUrl}/menu/${restaurantSlug}`;
    return this.generateQRCode(url);
  }
}

export const qrService = new QRService();

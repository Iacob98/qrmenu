import QRCode from 'qrcode';

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
      // Generate SVG QR code
      const qrCodeSVG = await QRCode.toString(url, {
        type: 'svg',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Generate PNG QR code as data URL
      const qrCodePNG = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return {
        url,
        qrCodeSVG,
        qrCodePNG,
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${handleError(error)}`);
    }
  }

  generateRestaurantQR(restaurantSlug: string): Promise<QRCodeData> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}/menu/${restaurantSlug}`;
    return this.generateQRCode(url);
  }
}

export const qrService = new QRService();

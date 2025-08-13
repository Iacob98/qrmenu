import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Copy, Check, ExternalLink, Download, QrCode } from "lucide-react";
import type { Restaurant } from "@shared/schema";

interface QRData {
  url: string;
  qrCodeSVG: string;
  qrCodePNG: string;
}

export default function QRPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get user restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  // Get selected restaurant
  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", selectedRestaurant],
    enabled: !!selectedRestaurant,
  });

  // Get QR code data
  const { data: qrData, isLoading: qrLoading } = useQuery<QRData>({
    queryKey: ["/api/restaurants", selectedRestaurant, "qr"],
    enabled: !!selectedRestaurant,
  });

  // Auto-select first restaurant
  useEffect(() => {
    if (restaurants && Array.isArray(restaurants) && restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurant]);

  const copyLink = () => {
    if (!qrData?.url) return;
    
    navigator.clipboard.writeText(qrData.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: t('linkCopied'),
      description: t('menuLinkCopied'),
    });
  };

  const openMenu = () => {
    if (!qrData?.url) return;
    window.open(qrData.url, '_blank');
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrData) return;

    const content = format === 'svg' ? qrData.qrCodeSVG : qrData.qrCodePNG;
    const filename = `${restaurant?.name || 'menu'}-qr.${format}`;

    if (format === 'svg') {
      const blob = new Blob([content], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // For PNG, use the API URL directly
      const a = document.createElement('a');
      a.href = content;
      a.download = filename;
      a.click();
    }

    toast({
      title: t('qrDownloaded'),
      description: `${t('fileSaved')}: ${filename}`,
    });
  };

  const generatePrintTemplate = () => {
    if (!qrData || !restaurant) return;

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR-код - ${restaurant.name}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0;
            background: white;
          }
          .qr-container { 
            text-align: center; 
            padding: 40px;
            border: 2px solid #ddd;
            border-radius: 10px;
            max-width: 400px;
          }
          .qr-code { 
            width: 200px; 
            height: 200px; 
            margin: 20px auto;
            border: 1px solid #eee;
          }
          h1 { margin-bottom: 10px; color: #333; }
          .instruction { 
            margin-top: 20px; 
            font-size: 18px; 
            color: #666; 
          }
          .url { 
            margin-top: 10px; 
            font-size: 12px; 
            color: #999; 
            word-break: break-all;
          }
          @media print {
            body { margin: 0; }
            .qr-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <h1>${restaurant.name}</h1>
          <div class="qr-code">
            ${qrData.qrCodeSVG}
          </div>
          <div class="instruction">
            ${t('scanQRCode')}<br>
            ${t('toOpenMenu')}
          </div>
          <div class="url">${qrData.url}</div>
        </div>
      </body>
      </html>
    `;

    printWindow?.document.write(printContent);
    printWindow?.document.close();
    
    setTimeout(() => {
      printWindow?.print();
    }, 500);
  };

  if (restaurantsLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">{t('selectRestaurant')}</h2>
            <p className="text-gray-600">{t('selectRestaurantForQR')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0 w-full">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 lg:px-6 py-4">
            <div className="pl-16 lg:pl-0"> {/* Space for mobile menu button */}
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('qrPageTitle')}</h1>
              <p className="text-gray-600">{t('shareMenuWithGuests')}</p>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Restaurant Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg lg:text-xl">{t('publicMenuLink')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 text-sm lg:text-base">
                  {t('publicMenuDescription')}
                </p>
                
                {qrLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                  </div>
                ) : qrData ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={qrData.url}
                        readOnly
                        className="bg-gray-50 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        onClick={copyLink}
                        className="whitespace-nowrap"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? t('copied') : t('copyLink')}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={openMenu}
                      >
                        <ExternalLink size={16} className="mr-1" />
                        {t('openMenu')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    {t('qrLoadError')}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* QR Code */}
            {qrData && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <QrCode className="mr-2" size={20} />
{t('qrCode')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="bg-white p-6 rounded-lg border inline-block">
                      <div 
                        dangerouslySetInnerHTML={{ __html: qrData.qrCodeSVG }}
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-gray-600 mt-4 mb-6">
{t('scanToOpenMenu')}
                    </p>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => downloadQR('png')}
                        className="w-full"
                      >
                        <Download className="mr-2" size={16} />
                        {t('downloadQR')} (PNG)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => downloadQR('svg')}
                        className="w-full"
                      >
                        <Download className="mr-2" size={16} />
                        {t('downloadQR')} (SVG)
                      </Button>
                      <Button
                        onClick={generatePrintTemplate}
                        className="w-full"
                      >
{t('downloadForPrintPDF')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('howToUseQR')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h4 className="font-medium">{t('qrInstructions1Title')}</h4>
                          <p className="text-gray-600 text-sm">
                            {t('qrInstructions1Desc')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h4 className="font-medium">{t('qrInstructions2Title')}</h4>
                          <p className="text-gray-600 text-sm">
                            {t('qrInstructions2Desc')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          3
                        </div>
                        <div>
                          <h4 className="font-medium">{t('qrInstructions3Title')}</h4>
                          <p className="text-gray-600 text-sm">
                            {t('qrInstructions3Desc')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          4
                        </div>
                        <div>
                          <h4 className="font-medium">{t('qrInstructions4Title')}</h4>
                          <p className="text-gray-600 text-sm">
                            {t('qrInstructions4Desc')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('additionalSettings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    {t('additionalFunctions')}
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• {t('qrColorCustomization')}</li>
                    <li>• {t('logoIntegration')}</li>
                    <li>• {t('analytics')}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

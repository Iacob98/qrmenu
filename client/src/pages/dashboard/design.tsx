import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Sidebar } from "@/components/layout/sidebar";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Palette, RotateCcw, Save, ExternalLink, Image } from "lucide-react";
import type { RestaurantWithCategories } from "@shared/schema";

const getColorThemes = (t: (key: string) => string) => ({
  default: {
    name: t('defaultTheme'),
    primary: "#22c55e",
    accent: "#f59e0b",
    background: "#ffffff",
    cardBg: "#ffffff",
    text: "#111827",
  },
  elegant: {
    name: t('elegantTheme'),
    primary: "#6366f1",
    accent: "#ec4899", 
    background: "#f8fafc",
    cardBg: "#ffffff",
    text: "#1e293b",
  },
  warm: {
    name: t('warmTheme'),
    primary: "#f59e0b",
    accent: "#dc2626",
    background: "#fef3c7",
    cardBg: "#fffbeb",
    text: "#92400e",
  },
  dark: {
    name: t('darkTheme'),
    primary: "#10b981",
    accent: "#f59e0b",
    background: "#1f2937",
    cardBg: "#374151",
    text: "#f9fafb",
  },
});

const getFontOptions = (t: (key: string) => string) => [
  { value: "Inter", label: t('interFont') },
  { value: "Roboto", label: t('robotoFont') },
  { value: "Open Sans", label: t('openSansFont') },
  { value: "Source Sans Pro", label: t('sourceSansFont') },
  { value: "Lato", label: t('latoFont') },
  { value: "Nunito", label: t('nunitoFont') },
  { value: "PT Sans", label: t('ptSansFont') },
  { value: "PT Serif", label: t('ptSerifFont') },
  { value: "Fira Sans", label: t('firaFont') },
  { value: "Ubuntu", label: t('ubuntuFont') },
];

export default function Design() {
  const { t } = useTranslation();
  const colorThemes = getColorThemes(t);
  const fontOptions = getFontOptions(t);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [designSettings, setDesignSettings] = useState({
    theme: "default",
    primaryColor: "#22c55e",
    accentColor: "#f59e0b",
    backgroundColor: "#ffffff",
    cardBackground: "#ffffff",
    textColor: "#111827",
    fontFamily: "Inter",
    fontSize: "medium",
    cardBorderRadius: 8,
    cardSpacing: "normal",
    showImages: true,
    logoPosition: "left",
    bannerHeight: 96, // Высота баннера в пикселях (64-200)
    bannerPositionX: 50, // Позиция по горизонтали (0-100%)
    bannerPositionY: 50, // Позиция по вертикали (0-100%)
    bannerOverlayColor: "#000000", // Цвет заливки
    bannerOverlayOpacity: 40, // Прозрачность заливки (0-100%)
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounced design for iframe preview - prevents too many reloads
  const [debouncedDesign, setDebouncedDesign] = useState(designSettings);

  // Get user restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  // Get selected restaurant with categories and dishes
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<RestaurantWithCategories>({
    queryKey: ["/api/restaurants", selectedRestaurant],
    enabled: !!selectedRestaurant,
  });

  // Load existing design settings when restaurant data changes
  useEffect(() => {
    if (restaurant?.design && typeof restaurant.design === 'object') {
      setDesignSettings(prev => ({ ...prev, ...(restaurant.design as Record<string, any>) }));
    }
  }, [restaurant]);

  // Auto-select first restaurant
  useEffect(() => {
    if (restaurants && Array.isArray(restaurants) && restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurant]);

  // Debounce design changes for iframe preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDesign(designSettings);
    }, 300);
    return () => clearTimeout(timer);
  }, [designSettings]);

  // Generate preview URL for iframe
  const previewUrl = useMemo(() => {
    if (!restaurant?.slug) return '';
    const params = new URLSearchParams({
      preview: 'true',
      design: JSON.stringify(debouncedDesign),
    });
    return `/menu/${restaurant.slug}?${params}`;
  }, [restaurant?.slug, debouncedDesign]);

  const saveDesignMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/restaurants/${selectedRestaurant}`, {
        design: designSettings,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
      toast({
        title: t('designSaved'),
        description: t('designApplied'),
      });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const applyTheme = (theme: keyof typeof colorThemes) => {
    const themeColors = colorThemes[theme];
    setDesignSettings(prev => ({
      ...prev,
      theme,
      primaryColor: themeColors.primary,
      accentColor: themeColors.accent,
      backgroundColor: themeColors.background,
      cardBackground: themeColors.cardBg,
      textColor: themeColors.text,
    }));
  };

  const resetDesign = () => {
    setDesignSettings({
      theme: "default",
      primaryColor: "#22c55e",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      cardBackground: "#ffffff",
      textColor: "#111827",
      fontFamily: "Inter",
      fontSize: "medium",
      cardBorderRadius: 8,
      cardSpacing: "normal",
      showImages: true,
      logoPosition: "left",
      bannerHeight: 96,
      bannerPositionX: 50,
      bannerPositionY: 50,
      bannerOverlayColor: "#000000",
      bannerOverlayOpacity: 40,
    });
  };

  const handlePreview = () => {
    if (restaurant) {
      // Open preview with design parameters
      const params = new URLSearchParams({
        preview: "true",
        design: JSON.stringify(designSettings),
      });
      window.open(`/menu/${restaurant.slug}?${params}`, '_blank');
    }
  };

  if (restaurantsLoading || restaurantLoading) {
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
            <p className="text-gray-600">{t('noRestaurantSelected')}</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('designTitle')}</h1>
                  <p className="text-gray-600">{t('colorScheme')}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={handlePreview} className="w-full sm:w-auto">
                    <ExternalLink className="mr-2" size={16} />
                    <span className="hidden sm:inline">{t('preview')}</span>
                    <span className="sm:hidden">{t('preview')}</span>
                  </Button>
                  <Button onClick={() => saveDesignMutation.mutate()} className="w-full sm:w-auto">
                    <Save className="mr-2" size={16} />
                    <span className="hidden sm:inline">{t('saveDesign')}</span>
                    <span className="sm:hidden">{t('saveChanges')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Left Panel - Design Settings */}
          <div className="w-80 bg-white border-r p-6 h-screen overflow-y-auto">
            <div className="space-y-6">
              {/* Color Scheme */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="mr-2" size={20} />
                    {t('colorSchemeCard')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('readyThemes')}</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(colorThemes).map(([key, theme]) => (
                        <Button
                          key={key}
                          variant={designSettings.theme === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => applyTheme(key as keyof typeof colorThemes)}
                          className="justify-start"
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: theme.primary }}
                          />
                          {theme.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="primaryColor">{t('primaryColor')}</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={designSettings.primaryColor}
                        onChange={(e) => setDesignSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-10 h-10 border rounded"
                      />
                      <span className="text-sm text-gray-600">{designSettings.primaryColor}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="accentColor">{t('accentColor')}</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={designSettings.accentColor || "#f59e0b"}
                        onChange={(e) => setDesignSettings(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-10 h-10 border rounded"
                      />
                      <span className="text-sm text-gray-600">{designSettings.accentColor || "#f59e0b"}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="backgroundColor">{t('backgroundColor')}</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={designSettings.backgroundColor}
                        onChange={(e) => setDesignSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-10 h-10 border rounded"
                      />
                      <span className="text-sm text-gray-600">{designSettings.backgroundColor}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardBackground">{t('cardBackground')}</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={designSettings.cardBackground}
                        onChange={(e) => setDesignSettings(prev => ({ ...prev, cardBackground: e.target.value }))}
                        className="w-10 h-10 border rounded"
                      />
                      <span className="text-sm text-gray-600">{designSettings.cardBackground}</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="textColor">{t('textColor')}</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="color"
                        value={designSettings.textColor}
                        onChange={(e) => setDesignSettings(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-10 h-10 border rounded"
                      />
                      <span className="text-sm text-gray-600">{designSettings.textColor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('fontCard')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('fontFamily')}</Label>
                    <Select
                      value={designSettings.fontFamily}
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, fontFamily: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>{t('fontSize')}</Label>
                    <Select
                      value={designSettings.fontSize}
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, fontSize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">{t('small')}</SelectItem>
                        <SelectItem value="medium">{t('medium')}</SelectItem>
                        <SelectItem value="large">{t('large')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Card Style */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cardStyleCard')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('borderRadius')}</Label>
                    <Slider
                      value={[designSettings.cardBorderRadius]}
                      onValueChange={([value]) => setDesignSettings(prev => ({ ...prev, cardBorderRadius: value }))}
                      max={20}
                      step={1}
                      className="mt-2"
                    />
                    <span className="text-sm text-gray-600">{designSettings.cardBorderRadius}px</span>
                  </div>
                  
                  <div>
                    <Label>{t('padding')}</Label>
                    <Select
                      value={designSettings.cardSpacing}
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, cardSpacing: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">{t('compact')}</SelectItem>
                        <SelectItem value="normal">{t('normal')}</SelectItem>
                        <SelectItem value="spacious">{t('spacious')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4 text-gray-500" />
                      <Label htmlFor="showImages">{t('showImages')}</Label>
                    </div>
                    <Switch
                      id="showImages"
                      checked={designSettings.showImages}
                      onCheckedChange={(checked) => setDesignSettings(prev => ({ ...prev, showImages: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Layout */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('designCard')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{t('restaurantLogo')}</Label>
                    <Select
                      value={designSettings.logoPosition}
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, logoPosition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">{t('left')}</SelectItem>
                        <SelectItem value="hidden">{t('hidden')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">{t('bannerPositioning')}</Label>

                    {/* Banner position preview */}
                    {restaurant?.banner && (
                      <div
                        className="relative w-full rounded-lg overflow-hidden border"
                        style={{
                          height: `${Math.min(designSettings.bannerHeight, 120)}px`,
                          backgroundImage: `url(${restaurant.banner})`,
                          backgroundSize: 'cover',
                          backgroundPosition: `${designSettings.bannerPositionX}% ${designSettings.bannerPositionY}%`
                        }}
                      >
                        {/* Overlay preview */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: designSettings.bannerOverlayColor,
                            opacity: designSettings.bannerOverlayOpacity / 100
                          }}
                        />
                        {/* Position indicator */}
                        <div
                          className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            left: `${designSettings.bannerPositionX}%`,
                            top: `${designSettings.bannerPositionY}%`
                          }}
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs">{t('bannerHeight')}</Label>
                      <Slider
                        value={[designSettings.bannerHeight]}
                        onValueChange={([value]) => setDesignSettings(prev => ({ ...prev, bannerHeight: value }))}
                        min={64}
                        max={200}
                        step={8}
                        className="mt-2"
                      />
                      <span className="text-sm text-gray-600">{designSettings.bannerHeight}px</span>
                    </div>

                    <div>
                      <Label className="text-xs">{t('horizontalPosition')}</Label>
                      <Slider
                        value={[designSettings.bannerPositionX]}
                        onValueChange={([value]) => setDesignSettings(prev => ({ ...prev, bannerPositionX: value }))}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-gray-600">{designSettings.bannerPositionX}%</span>
                    </div>

                    <div>
                      <Label className="text-xs">{t('verticalPosition')}</Label>
                      <Slider
                        value={[designSettings.bannerPositionY]}
                        onValueChange={([value]) => setDesignSettings(prev => ({ ...prev, bannerPositionY: value }))}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-gray-600">{designSettings.bannerPositionY}%</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-sm font-medium">{t('bannerOverlay')}</Label>
                    
                    <div>
                      <Label className="text-xs">{t('overlayColor')}</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="color"
                          value={designSettings.bannerOverlayColor}
                          onChange={(e) => setDesignSettings(prev => ({ ...prev, bannerOverlayColor: e.target.value }))}
                          className="w-10 h-10 border rounded"
                        />
                        <span className="text-sm text-gray-600">{designSettings.bannerOverlayColor}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">{t('overlayOpacity')}</Label>
                      <Slider
                        value={[designSettings.bannerOverlayOpacity]}
                        onValueChange={([value]) => setDesignSettings(prev => ({ ...prev, bannerOverlayOpacity: value }))}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <span className="text-sm text-gray-600">{designSettings.bannerOverlayOpacity}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={resetDesign}
                  className="flex-1"
                >
                  <RotateCcw className="mr-2" size={16} />
                  {t('reset')}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Live Preview via iframe */}
          <div className="flex-1 p-6 bg-gray-50 flex items-start justify-center">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-3">{t('livePreview')}</p>
              {previewUrl ? (
                <iframe
                  key={previewUrl}
                  src={previewUrl}
                  className="w-[375px] h-[667px] rounded-xl shadow-xl border-0 bg-white"
                  title="Menu Preview"
                  style={{
                    maxWidth: '100%',
                    border: '8px solid #1f2937',
                    borderRadius: '32px',
                  }}
                />
              ) : (
                <div className="w-[375px] h-[667px] rounded-xl shadow-xl bg-white flex items-center justify-center">
                  <p className="text-gray-500">{t('selectRestaurant')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

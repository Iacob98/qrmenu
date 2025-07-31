import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sidebar } from "@/components/layout/sidebar";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { DishCard } from "@/components/menu/dish-card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Palette, RotateCcw, Save, ExternalLink } from "lucide-react";
import type { RestaurantWithCategories } from "@shared/schema";

const colorThemes = {
  default: {
    name: "По умолчанию",
    primary: "#22c55e",
    accent: "#f59e0b",
    background: "#ffffff",
    cardBg: "#ffffff",
    text: "#111827",
  },
  elegant: {
    name: "Элегантный",
    primary: "#6366f1",
    accent: "#ec4899", 
    background: "#f8fafc",
    cardBg: "#ffffff",
    text: "#1e293b",
  },
  warm: {
    name: "Тёплый",
    primary: "#f59e0b",
    accent: "#dc2626",
    background: "#fef3c7",
    cardBg: "#fffbeb",
    text: "#92400e",
  },
  dark: {
    name: "Тёмный",
    primary: "#10b981",
    accent: "#f59e0b",
    background: "#1f2937",
    cardBg: "#374151",
    text: "#f9fafb",
  },
};

const fontOptions = [
  { value: "Inter", label: "Inter (по умолчанию)" },
  { value: "Roboto", label: "Roboto" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
];

export default function Design() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    showLogo: true,
    logoPosition: "left",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        title: "Дизайн сохранён",
        description: "Изменения применены к вашему меню",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
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
      showLogo: true,
      logoPosition: "left",
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

  const getFilteredDishes = () => {
    if (!restaurant) return [];
    
    if (!selectedCategory) {
      return restaurant.categories.flatMap(cat => cat.dishes);
    }
    
    const category = restaurant.categories.find(cat => cat.id === selectedCategory);
    return category?.dishes || [];
  };

  if (restaurantsLoading || restaurantLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Выберите ресторан</h2>
            <p className="text-gray-600">Для настройки дизайна выберите ресторан</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredDishes = getFilteredDishes();

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Редактор дизайна меню</h1>
                <p className="text-gray-600">Настройте внешний вид вашего меню</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handlePreview}>
                  <ExternalLink className="mr-2" size={16} />
                  Предпросмотр в новой вкладке
                </Button>
                <Button onClick={() => saveDesignMutation.mutate()}>
                  <Save className="mr-2" size={16} />
                  Сохранить стиль
                </Button>
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
                    Цветовая схема
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Готовые темы</Label>
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
                    <Label htmlFor="primaryColor">Основной цвет</Label>
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
                    <Label htmlFor="accentColor">Акцентный цвет</Label>
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
                    <Label htmlFor="backgroundColor">Цвет фона</Label>
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
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle>Шрифт</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Семейство шрифтов</Label>
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
                    <Label>Размер шрифта</Label>
                    <Select
                      value={designSettings.fontSize}
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, fontSize: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Маленький</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="large">Большой</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Card Style */}
              <Card>
                <CardHeader>
                  <CardTitle>Стиль карточек блюд</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Скругление углов</Label>
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
                    <Label>Отступы</Label>
                    <Select
                      value={designSettings.cardSpacing}
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, cardSpacing: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Компактные</SelectItem>
                        <SelectItem value="normal">Обычные</SelectItem>
                        <SelectItem value="spacious">Просторные</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Layout */}
              <Card>
                <CardHeader>
                  <CardTitle>Оформление</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Логотип ресторана</Label>
                    <Select
                      value={designSettings.logoPosition}
                      onValueChange={(value) => setDesignSettings(prev => ({ ...prev, logoPosition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Слева от названия</SelectItem>
                        <SelectItem value="center">По центру</SelectItem>
                        <SelectItem value="hidden">Скрыть</SelectItem>
                      </SelectContent>
                    </Select>
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
                  Сбросить
                </Button>
              </div>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 bg-gray-50">
            <div className="max-w-md mx-auto">
              {/* Preview Container */}
              <div 
                className="bg-white rounded-xl shadow-xl overflow-hidden"
                style={{
                  backgroundColor: designSettings.backgroundColor,
                  fontFamily: designSettings.fontFamily,
                  color: designSettings.textColor,
                }}
              >
                {/* Menu Header */}
                <div 
                  className="text-white p-6 text-center"
                  style={{ backgroundColor: designSettings.primaryColor }}
                >
                  <h1 className="text-xl font-bold">{restaurant.name}</h1>
                  {restaurant.city && (
                    <p className="opacity-90">{restaurant.city}</p>
                  )}
                  <div className="flex justify-center space-x-4 mt-3 text-sm opacity-90">
                    <span>🇷🇺 Русский</span>
                    <span>💶 {restaurant.currency}</span>
                  </div>
                </div>

                {/* Category Tabs */}
                <CategoryTabs
                  categories={restaurant.categories}
                  activeCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                />

                {/* Dishes List */}
                <div 
                  className="p-4 space-y-3 max-h-96 overflow-y-auto"
                  style={{
                    gap: designSettings.cardSpacing === "compact" ? "8px" : 
                         designSettings.cardSpacing === "spacious" ? "16px" : "12px"
                  }}
                >
                  {filteredDishes.slice(0, 3).map((dish) => (
                    <div
                      key={dish.id}
                      className="border p-3 transition-all"
                      style={{
                        backgroundColor: designSettings.cardBackground,
                        borderRadius: `${designSettings.cardBorderRadius}px`,
                        fontSize: designSettings.fontSize === "small" ? "14px" :
                                 designSettings.fontSize === "large" ? "18px" : "16px",
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{dish.name}</h3>
                          {dish.description && (
                            <p 
                              className="text-sm mb-2 opacity-75"
                              style={{ color: designSettings.textColor }}
                            >
                              {dish.description.slice(0, 80)}...
                            </p>
                          )}
                          {dish.tags && dish.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {dish.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: designSettings.primaryColor + "20",
                                    color: designSettings.primaryColor,
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span 
                          className="font-bold ml-2"
                          style={{ color: designSettings.primaryColor }}
                        >
                          €{dish.price}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredDishes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Добавьте блюда для предпросмотра</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 text-center text-xs text-gray-600">
                  <p>Создано с помощью QRMenu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

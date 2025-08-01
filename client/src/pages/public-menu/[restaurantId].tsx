import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemoCategoryTabs } from "@/components/optimized/memo-category-tabs";
import { MemoDishCard } from "@/components/optimized/memo-dish-card";

import { DishDetailsModal } from "@/components/modals/dish-details";
import { ErrorBoundary, ErrorFallback } from "@/components/error-boundary";
import { useRealTimeMenu } from "@/hooks/useRealTimeMenu";
import { Search, X, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicMenu, Dish } from "@shared/schema";

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'PLN': 'zł',
    'MDL': 'lei',
  };
  return symbols[currency] || currency;
}

function getTagEmoji(tag: string): string {
  const emojis: Record<string, string> = {
    "vegetarian": "🥦",
    "vegan": "🌱",
    "spicy": "🌶️",
    "gluten-free": "🌾",
    "dairy-free": "🥛",
    "meat": "🥩",
  };
  return emojis[tag] || "🏷️";
}

function PublicMenuContent() {
  // All hooks must be called in the same order every time
  const [, params] = useRoute("/menu/:slug");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  // Query hook - must always be called
  const { data: menu, isLoading, error } = useQuery<PublicMenu>({
    queryKey: ["/api/public/menu", params?.slug],
    enabled: !!params?.slug,
  });

  // Get all unique tags from dishes - Memoized for performance
  const allTags = useMemo(() => {
    if (!menu) return [];
    return Array.from(new Set(
      menu.categories
        .flatMap(cat => cat.dishes)
        .flatMap(dish => dish.tags || [])
    ));
  }, [menu]);

  // Real-time updates for dynamic menu synchronization
  const { isConnected } = useRealTimeMenu(params?.slug || "");

  // Helper function to create menu with favorites - Memoized for performance
  const menuWithFavorites = useMemo(() => {
    if (!menu) return null;

    const favoritesDishes = menu.categories
      .flatMap(cat => cat.dishes)
      .filter(dish => dish.isFavorite && !dish.isHidden);

    const categoriesWithFavorites = [];

    // Add favorites as first category only if there are favorite dishes
    if (favoritesDishes.length > 0) {
      categoriesWithFavorites.push({
        id: 'favorites',
        name: menu.restaurant.favoritesTitle || 'Избранное',
        restaurantId: '',
        icon: '⭐',
        sortOrder: -1,
        dishes: favoritesDishes,
      } as any);
    }

    // Add regular categories
    categoriesWithFavorites.push(...menu.categories);

    return {
      ...menu,
      categories: categoriesWithFavorites,
    };
  }, [menu]);

  // Effect hooks - must always be called
  useEffect(() => {
    if (menuWithFavorites && selectedCategory === null && menuWithFavorites.categories.length > 0) {
      setSelectedCategory(menuWithFavorites.categories[0].id);
    }
  }, [menu, selectedCategory, menuWithFavorites]);

  useEffect(() => {
    if (!menuWithFavorites) {
      setFilteredDishes([]);
      return;
    }

    let dishes: Dish[] = [];

    if (selectedCategory) {
      const category = menuWithFavorites.categories.find(cat => cat.id === selectedCategory);
      dishes = category?.dishes || [];
    } else {
      // Show all dishes from regular categories (excluding favorites to avoid duplicates)
      dishes = menuWithFavorites.categories
        .filter(cat => cat.id !== 'favorites')
        .flatMap(cat => cat.dishes);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      dishes = dishes.filter(dish =>
        dish.name.toLowerCase().includes(query) ||
        dish.description?.toLowerCase().includes(query) ||
        dish.ingredients?.some(ingredient => ingredient.toLowerCase().includes(query))
      );
    }

    // Apply tag filters
    if (activeTags.length > 0) {
      dishes = dishes.filter(dish =>
        activeTags.every(tag => dish.tags?.includes(tag))
      );
    }

    setFilteredDishes(dishes);
  }, [menu, selectedCategory, searchQuery, activeTags]);

  // Dynamic Google Font Loading with Cyrillic support
  const loadGoogleFont = (fontFamily: string) => {
    // Font already preloaded in HTML, just return resolved promise
    if (['Inter', 'Roboto', 'Open Sans', 'Source Sans Pro', 'Lato', 'Nunito', 'PT Sans', 'PT Serif', 'Fira Sans', 'Ubuntu'].includes(fontFamily)) {
      return Promise.resolve();
    }

    // Remove existing dynamic font link
    const existingLink = document.querySelector('#dynamic-google-font');
    if (existingLink) {
      existingLink.remove();
    }

    // Create new link for Google Font with Cyrillic support
    const link = document.createElement('link');
    link.id = 'dynamic-google-font';
    link.rel = 'stylesheet';
    
    // Handle font names with spaces and add Cyrillic support
    const fontUrl = fontFamily.includes(' ') 
      ? fontFamily.replace(/ /g, '+')
      : fontFamily;
    
    link.href = `https://fonts.googleapis.com/css2?family=${fontUrl}:wght@300;400;500;600;700&subset=cyrillic,cyrillic-ext,latin,latin-ext&display=swap`;
    
    return new Promise<void>((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Continue even if font fails to load
      document.head.appendChild(link);
    });
  };

  useEffect(() => {
    if (!menu?.restaurant?.design) return;

    const design = menu.restaurant.design;
    const root = document.documentElement;
    
    console.log('Applying design settings:', design);
    
    const applyDesign = async () => {
      // Load Google Font first if fontFamily is specified
      if (design.fontFamily && design.fontFamily !== 'system-ui') {
        await loadGoogleFont(design.fontFamily);
      }
      
      // Apply colors
      if (design.primaryColor) {
        root.style.setProperty('--primary', design.primaryColor);
        root.style.setProperty('--primary-600', design.primaryColor);
        root.style.setProperty('--primary-700', design.primaryColor);
      }
      if (design.accentColor) {
        root.style.setProperty('--accent', design.accentColor);
        root.style.setProperty('--accent-600', design.accentColor);
        root.style.setProperty('--accent-700', design.accentColor);
      }
      if (design.backgroundColor) {
        root.style.setProperty('--background', design.backgroundColor);
        root.style.setProperty('--card-background', design.cardBackground || design.backgroundColor);
      }
      if (design.cardBackground) {
        root.style.setProperty('--card-background', design.cardBackground);
      }
      if (design.textColor) {
        root.style.setProperty('--foreground', design.textColor);
      }
      
      // Apply font family after loading
      if (design.fontFamily) {
        const fontFamilyValue = design.fontFamily === 'system-ui' 
          ? 'system-ui, -apple-system, sans-serif'
          : `"${design.fontFamily}", sans-serif`;
        
        root.style.setProperty('--font-family', fontFamilyValue);
        document.body.style.fontFamily = fontFamilyValue;
      }
      
      // Apply font size
      if (design.fontSize) {
        const fontSizeMap: Record<string, string> = {
          small: '14px',
          medium: '16px',  
          large: '18px'
        };
        const fontSize = fontSizeMap[design.fontSize as string] || '16px';
        root.style.setProperty('--font-size', fontSize);
        document.body.style.fontSize = fontSize;
      }
      
      // Apply border radius
      if (design.cardBorderRadius !== undefined) {
        root.style.setProperty('--card-radius', `${design.cardBorderRadius}px`);
      }
      
      // Apply card spacing
      if (design.cardSpacing) {
        const spacingMap: Record<string, string> = {
          compact: '8px',
          normal: '12px',
          spacious: '16px'
        };
        const spacing = spacingMap[design.cardSpacing as string] || '12px';
        root.style.setProperty('--card-spacing', spacing);
      }
    };
    
    // Apply design
    applyDesign();
    
    // Cleanup on unmount
    return () => {
      const root = document.documentElement;
      // Remove dynamic font link
      const fontLink = document.querySelector('#dynamic-google-font');
      if (fontLink) fontLink.remove();
      
      // Reset CSS variables
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-600');
      root.style.removeProperty('--primary-700');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-600');
      root.style.removeProperty('--accent-700');
      root.style.removeProperty('--background');
      root.style.removeProperty('--card-background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--font-family');
      root.style.removeProperty('--font-size');
      root.style.removeProperty('--card-radius');
      root.style.removeProperty('--card-spacing');
      
      // Reset body styles
      document.body.style.fontFamily = '';
      document.body.style.fontSize = '';
    };
  }, [menu?.restaurant?.design]);

  const handleTagFilter = useCallback((tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTags([]);
    setSearchQuery("");
  }, []);

  // Early returns after all hooks have been called
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Загружается меню...</p>
          <p className="text-gray-400 text-xs mt-2">
            {navigator.userAgent.includes('Mobile') ? 'Мобильная версия' : 'Версия для ПК'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Меню не найдено</h1>
          <p className="text-gray-600 mb-4">
            Проверьте правильность ссылки или обратитесь в ресторан
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-4 hover:bg-green-700 transition-colors"
          >
            Обновить страницу
          </button>
          
          {error && (
            <details className="text-left mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer mb-2">
                Техническая информация
              </summary>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                <p>Ошибка: {error.message}</p>
                <p>URL: {window.location.href}</p>
                <p>Устройство: {navigator.userAgent}</p>
                <p>Время: {new Date().toLocaleString()}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gray-50 antialiased safe-area-inset"
      style={{ 
        backgroundColor: 'var(--background, #f9fafb)',
        fontFamily: 'var(--font-family, "Inter", system-ui, -apple-system, sans-serif)',
        fontSize: 'var(--font-size, 16px)',
        color: 'var(--foreground, #111827)',
        lineHeight: '1.5',
        WebkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%'
      }}
    >
      {/* Mobile-First Layout with error boundary */}
      <div className="max-w-lg mx-auto bg-white min-h-screen relative">
        
        {/* Compact Header */}
        <div 
          className="sticky top-0 z-50 bg-white border-b shadow-sm header-sticky"
        >
          <div 
            className="flex items-center p-4 space-x-3"
            style={{
              flexDirection: menu?.restaurant?.design?.logoPosition === 'top' ? 'column' : 'row',
              textAlign: menu?.restaurant?.design?.logoPosition === 'top' ? 'center' : 'left'
            }}
          >
            {/* Logo with positioning */}
            {menu?.restaurant?.logo && menu?.restaurant?.design?.logoPosition !== 'hidden' && (
              <img 
                src={menu.restaurant.logo} 
                alt="Логотип"
                className={cn(
                  "object-cover flex-shrink-0",
                  menu?.restaurant?.design?.logoPosition === 'top' 
                    ? "w-16 h-16 rounded-lg mb-2" 
                    : "w-12 h-12 rounded-full",
                  menu?.restaurant?.design?.logoPosition === 'right' && "order-2 ml-auto"
                )}
                style={{
                  borderRadius: menu?.restaurant?.design?.logoPosition === 'top' ? '8px' : '50%'
                }}
              />
            )}
            
            {/* Restaurant Info */}
            <div 
              className={cn(
                "min-w-0 flex-1",
                menu?.restaurant?.design?.logoPosition === 'top' && "flex-none",
                menu?.restaurant?.design?.logoPosition === 'right' && "order-1"
              )}
            >
              <h1 
                className={cn(
                  "font-bold truncate",
                  menu?.restaurant?.design?.logoPosition === 'top' ? "text-xl" : "text-lg"
                )}
                style={{ color: 'var(--primary, #1f2937)' }}
              >
                {menu?.restaurant?.name}
              </h1>
              <p 
                className={cn(
                  "text-gray-500 truncate",
                  menu?.restaurant?.design?.logoPosition === 'top' ? "text-base" : "text-sm"
                )}
              >
                {menu?.restaurant?.city || 'Меню ресторана'}
              </p>
            </div>
          </div>
        </div>

        {/* Banner (if exists) - Simplified */}
        {menu?.restaurant?.banner && menu.restaurant.banner.trim() !== '' && (
          <div 
            className="h-24 bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${menu.restaurant.banner})`,
              backgroundPosition: `${menu?.restaurant?.design?.bannerPositionX || 50}% ${menu?.restaurant?.design?.bannerPositionY || 50}%`
            }}
          >
            <div 
              className="absolute inset-0"
              style={{
                backgroundColor: menu?.restaurant?.design?.bannerOverlayColor || 'transparent',
                opacity: (menu?.restaurant?.design?.bannerOverlayOpacity || 0) / 100
              }}
            />
          </div>
        )}

        {/* Simple Search */}
        <div className="p-3 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Найти блюдо..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-base border-gray-300"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Sticky Category Tabs - Mobile optimized */}
        <div className="sticky-nav top-[73px] md:top-[105px] z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <MemoCategoryTabs
            categories={menuWithFavorites?.categories || []}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Active Filters - Compact */}
        {(activeTags.length > 0 || searchQuery) && (
          <div className="p-3 bg-blue-50 border-b">
            <div className="flex flex-wrap gap-1 text-xs">
              {searchQuery && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  🔍 {searchQuery}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {activeTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs px-2 py-1">
                  {getTagEmoji(tag)} {tag}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => handleTagFilter(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Simple Dishes List */}
        <div className="p-3 space-y-3">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-12">
              <Utensils className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">
                {searchQuery || activeTags.length > 0 
                  ? "Ничего не найдено"
                  : "Нет блюд в категории"
                }
              </p>
              {(searchQuery || activeTags.length > 0) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={clearFilters}
                >
                  Сбросить
                </Button>
              )}
            </div>
          ) : (
            filteredDishes.map((dish) => (
              <MemoDishCard
                key={dish.id}
                dish={dish}
                currency={menu?.restaurant?.currency || 'EUR'}
                onViewDetails={setSelectedDish}
                isCompact={false}
              />
            ))
          )}
        </div>

        
        {/* Dish Details Modal */}
        {selectedDish && (
          <DishDetailsModal
            dish={selectedDish}
            currency={menu?.restaurant?.currency || 'EUR'}
            onClose={() => setSelectedDish(null)}
          />
        )}

        {/* Connection Status - Minimal */}
        {!isConnected && (
          <div className="fixed bottom-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            ⏳
          </div>
        )}
      </div>
    </div>
  );
}

// Main export with Error Boundary
export default function PublicMenu() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <PublicMenuContent />
    </ErrorBoundary>
  );
}
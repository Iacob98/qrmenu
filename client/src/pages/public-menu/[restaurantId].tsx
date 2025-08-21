import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemoCategoryTabs } from "@/components/optimized/memo-category-tabs";
import { MemoDishCard } from "@/components/optimized/memo-dish-card";
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from "@/components/ui/language-selector";

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
  const { t } = useTranslation();
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
        name: menu.restaurant.favoritesTitle || t('favorites'),
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
          <p className="text-gray-600 text-sm">{t('loading')}</p>
          <p className="text-gray-400 text-xs mt-2">
            {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{t('noResults')}</h1>
          <p className="text-gray-600 mb-4">
            {t('error')}
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-2 rounded-lg mb-4 hover:bg-green-700 transition-colors"
          >
            {t('loading')}
          </button>
          
          {error && (
            <details className="text-left mt-4">
              <summary className="text-sm text-gray-500 cursor-pointer mb-2">
                Technical Information
              </summary>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                <p>{t('error')}: {error.message}</p>
                <p>URL: {window.location.href}</p>
                <p>Device: {navigator.userAgent}</p>
                <p>Time: {new Date().toLocaleString()}</p>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4"
      style={{ 
        fontFamily: 'var(--font-family, "Inter", system-ui, -apple-system, sans-serif)',
      }}
    >
      {/* Demo Phone Container */}
      <div className="relative max-w-sm mx-auto">
        {/* Phone Frame */}
        <div className="bg-black rounded-[3rem] p-2 shadow-2xl">
          <div className="bg-white rounded-[2.5rem] overflow-hidden">
            {/* Phone Screen Content */}
            <div className="w-80 h-[600px] overflow-auto bg-white relative">
              
              {/* Demo Header with gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white text-center">
                <h1 className="text-xl font-bold mb-1">Italienisches Restaurant</h1>
                <p className="text-blue-100 text-sm">QR-Code für Menü scannen</p>
              </div>

              
              {/* Demo Category Tabs */}
              <div className="bg-gray-50 px-4 py-3">
                <div className="flex space-x-6 text-sm">
                  <button className="font-semibold text-gray-900 pb-2 border-b-2 border-purple-500">
                    Suppen
                  </button>
                  <button className="text-gray-500 hover:text-gray-900">
                    Warme Gerichte
                  </button>
                  <button className="text-gray-500 hover:text-gray-900">
                    Desserts
                  </button>
                </div>
              </div>

              {/* Demo Dishes */}
              <div className="p-4 space-y-4">
                {/* Dish 1 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Ukrainischer Borschtsch</h3>
                      <p className="text-sm text-gray-600 mb-2">Rote Bete, Fleisch, Sauerrahm</p>
                      <div className="flex space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">€5.90</div>
                    </div>
                  </div>
                </div>

                {/* Dish 2 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">Fleisch-Soljanka</h3>
                      <p className="text-sm text-gray-600 mb-2">Geräucherte Wurst, Gurken, Zitrone</p>
                      <div className="flex space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-300">★</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">€6.50</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Caption below phone */}
        <div className="text-center mt-6 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Innovative Platform in der offenen Beta-Phase
          </h2>
          <p className="text-gray-600 text-lg">
            Seien Sie unter den Ersten, die den revolutionären Ansatz zur Erstellung digitaler Restaurantmenüs testen
          </p>
        </div>
      </div>

      {/* Dish Details Modal */}
      {selectedDish && (
        <DishDetailsModal
          dish={selectedDish}
          isOpen={!!selectedDish}
          onClose={() => setSelectedDish(null)}
          currencySymbol={getCurrencySymbol(menu?.restaurant?.currency || 'EUR')}
        />
      )}
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
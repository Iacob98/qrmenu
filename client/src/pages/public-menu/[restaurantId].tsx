import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryTabs } from "@/components/menu/category-tabs";
import { DishCard } from "@/components/menu/dish-card";
import { DishDetailsModal } from "@/components/modals/dish-details";
import { useRealTimeMenu } from "@/hooks/useRealTimeMenu";
import { Search, X, Utensils } from "lucide-react";
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

export default function PublicMenu() {
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

  // Get all unique tags from dishes
  const allTags = menu ? 
    Array.from(new Set(
      menu.categories
        .flatMap(cat => cat.dishes)
        .flatMap(dish => dish.tags || [])
    )) : [];

  // Real-time updates for dynamic menu synchronization
  const { isConnected } = useRealTimeMenu(params?.slug || "");

  // Helper function to create menu with favorites
  const getMenuWithFavorites = () => {
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
  };

  // Effect hooks - must always be called
  useEffect(() => {
    const menuWithFavorites = getMenuWithFavorites();
    if (menuWithFavorites && selectedCategory === null && menuWithFavorites.categories.length > 0) {
      setSelectedCategory(menuWithFavorites.categories[0].id);
    }
  }, [menu, selectedCategory]);

  useEffect(() => {
    const menuWithFavorites = getMenuWithFavorites();
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

  useEffect(() => {
    if (!menu?.restaurant?.design) return;

    const design = menu.restaurant.design;
    const root = document.documentElement;
    
    console.log('Applying design settings:', design);
    
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
    }
    if (design.textColor) {
      root.style.setProperty('--foreground', design.textColor);
    }
    if (design.fontFamily) {
      root.style.setProperty('--font-family', design.fontFamily);
      document.body.style.fontFamily = design.fontFamily;
    }
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
    if (design.cardRadius) {
      root.style.setProperty('--card-radius', `${design.cardRadius}px`);
    }
    if (design.cardSpacing) {
      const spacingMap: Record<string, string> = {
        compact: '8px',
        normal: '12px',
        spacious: '16px'
      };
      const spacing = spacingMap[design.cardSpacing as string] || '12px';
      root.style.setProperty('--card-spacing', spacing);
    }
    
    // Cleanup on unmount
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-600');
      root.style.removeProperty('--primary-700');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-600');
      root.style.removeProperty('--accent-700');
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--font-family');
      root.style.removeProperty('--font-size');
      root.style.removeProperty('--card-radius');
      root.style.removeProperty('--card-spacing');
      document.body.style.fontFamily = '';
      document.body.style.fontSize = '';
    };
  }, [menu?.restaurant?.design]);

  const handleTagFilter = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setActiveTags([]);
    setSearchQuery("");
  };

  // Early returns after all hooks have been called
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Меню не найдено</h1>
          <p className="text-gray-600">
            Проверьте правильность ссылки или обратитесь в ресторан
          </p>
          {error && <p className="text-red-500 mt-2">Ошибка: {error.message}</p>}
        </div>
      </div>
    );
  }

  const menuWithFavorites = getMenuWithFavorites();

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{ 
        backgroundColor: 'var(--background, #f9fafb)',
        fontFamily: 'var(--font-family, system-ui)',
        fontSize: 'var(--font-size, 16px)',
        color: 'var(--foreground, #111827)'
      }}
    >
      {/* Simplified Mobile-First Layout */}
      <div className="max-w-lg mx-auto bg-white min-h-screen">
        
        {/* Compact Header */}
        <div 
          className="sticky top-0 z-50 bg-white border-b shadow-sm"
        >
          <div className="flex items-center p-3 space-x-3">
            {menu?.restaurant?.logo && (
              <img 
                src={menu.restaurant.logo} 
                alt="Логотип"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-lg truncate" style={{ color: 'var(--primary, #1f2937)' }}>
                {menu?.restaurant?.name}
              </h1>
              <p className="text-sm text-gray-500 truncate">
                {menu?.restaurant?.city || 'Меню ресторана'}
              </p>
            </div>
          </div>
        </div>

        {/* Banner (if exists) - Simplified */}
        {menu?.restaurant?.banner && (
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

        {/* Category Tabs */}
        <CategoryTabs
          categories={menuWithFavorites?.categories || []}
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

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
              <DishCard
                key={dish.id}
                dish={dish}
                currency={menu?.restaurant?.currency || 'EUR'}
                onFilterByTag={handleTagFilter}
                onShowDetails={setSelectedDish}
                showActions={false}
                showDetails={true}
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
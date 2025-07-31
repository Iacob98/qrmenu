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
import { Search, X } from "lucide-react";
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
      root.style.setProperty('--font-size', design.fontSize);
    }
    if (design.cardRadius) {
      root.style.setProperty('--card-radius', `${design.cardRadius}px`);
    }
    if (design.cardSpacing) {
      root.style.setProperty('--card-spacing', design.cardSpacing);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto">
        {/* Menu Header */}
        <header className="bg-primary-600 text-white text-center relative overflow-hidden">
          {/* Banner Background */}
          {menu?.restaurant?.banner && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
              style={{ backgroundImage: `url(${menu.restaurant.banner})` }}
            />
          )}
          
          <div className="relative z-10 p-6">
            {menu?.restaurant?.logo && (
              <img 
                src={menu.restaurant.logo} 
                alt={menu.restaurant.name}
                className="w-16 h-16 mx-auto mb-4 rounded-full object-cover border-2 border-white/50"
              />
            )}
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">{menu?.restaurant?.name}</h1>
            {menu?.restaurant?.city && (
              <p className="text-white/90 drop-shadow-md">{menu.restaurant.city}</p>
            )}
            <div className="flex justify-center space-x-4 mt-4 text-sm text-white/90 drop-shadow-md">
              <span>🇷🇺 {menu?.restaurant?.language === 'ru' ? 'Русский' : 'Русский'}</span>
              <span>{getCurrencySymbol(menu?.restaurant?.currency || 'EUR')} {menu?.restaurant?.currency}</span>
            </div>
          </div>
        </header>

        {/* Category Tabs */}
        <CategoryTabs
          categories={menuWithFavorites?.categories || []}
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Search and Filters */}
        <div className="p-4 bg-gray-50">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Active Filters */}
          {(activeTags.length > 0 || searchQuery) && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Поиск: "{searchQuery}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => setSearchQuery("")}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                )}
                {activeTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleTagFilter(tag)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Очистить фильтры
              </Button>
            </div>
          )}
        </div>

        {/* Menu Content */}
        <div className="p-4 space-y-4">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery || activeTags.length > 0 ? (
                <div>
                  <p className="text-gray-500 mb-4">По вашему запросу ничего не найдено</p>
                  <Button onClick={clearFilters} variant="outline">
                    Показать все блюда
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">В этой категории пока нет блюд</p>
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

        {/* Footer */}
        <footer className="bg-gray-50 p-4 text-center text-sm text-gray-600 border-t mt-8">
          {menu?.restaurant?.phone && (
            <p className="mb-2">📞 {menu.restaurant.phone}</p>
          )}
          <p>Создано с помощью QRMenu</p>
        </footer>
      </div>

      {/* Dish Details Modal */}
      <DishDetailsModal
        dish={selectedDish}
        isOpen={!!selectedDish}
        onClose={() => setSelectedDish(null)}
        currency={menu?.restaurant?.currency || 'EUR'}
      />
    </div>
  );
}
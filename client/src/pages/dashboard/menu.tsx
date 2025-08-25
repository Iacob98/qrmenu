import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { AddCategoryModal } from "@/components/modals/add-category";
import { AddDishModal } from "@/components/modals/add-dish";
import { EditDishModal } from "@/components/modals/edit-dish";
import { EditCategoryModal } from "@/components/modals/edit-category";
import { CreateRestaurantModal } from "@/components/restaurant/create-restaurant-modal";
import { TestModal } from "@/components/test-modal";
import { SimpleCreateRestaurantModal } from "@/components/simple-create-restaurant-modal";
import { EditFavoritesTitleModal } from "@/components/modals/edit-favorites-title";
import { DishCard } from "@/components/menu/dish-card";
import { Plus, ExternalLink, User, Edit, Trash2, Settings, LogOut, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { useAuth } from "@/lib/auth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import type { RestaurantWithCategories, Dish, Category } from "@shared/schema";

export default function MenuManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addDishOpen, setAddDishOpen] = useState(false);
  const [editDishOpen, setEditDishOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [createRestaurantOpen, setCreateRestaurantOpen] = useState(false);
  const [editFavoritesTitleOpen, setEditFavoritesTitleOpen] = useState(false);
  
  // Debug: console.log('MenuManagement render - createRestaurantOpen:', createRestaurantOpen);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Get user restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  // Get selected restaurant with categories and dishes
  const { data: restaurant, isLoading: restaurantLoading } = useQuery<RestaurantWithCategories>({
    queryKey: ["/api/restaurants", selectedRestaurant],
    enabled: !!selectedRestaurant,
  });

  // Auto-select first restaurant
  useEffect(() => {
    if (restaurants && Array.isArray(restaurants) && restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurant]);

  const handleAddDish = (categoryId?: string) => {
    setSelectedCategoryId(categoryId || "");
    setAddDishOpen(true);
  };

  const handleEditDish = (dish: Dish) => {
    setSelectedDish(dish);
    setEditDishOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditCategoryOpen(true);
  };

  const deleteDishMutation = useMutation({
    mutationFn: async (dishId: string) => {
      return await apiRequest("DELETE", `/api/dishes/${dishId}`);
    },
    onSuccess: () => {
      toast({ title: t('dishCreated') + " " + t('delete') });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
    },
    onError: (error: any) => {
      toast({
        title: t('error') + " " + t('delete') + " " + t('dish'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteDish = (dish: Dish) => {
    if (confirm(`${t('confirmDeleteCategory')} "${dish.name}"?`)) {
      deleteDishMutation.mutate(dish.id);
    }
  };

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast({ title: t('categoryCreated') + " " + t('delete') });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
    },
    onError: (error: any) => {
      toast({
        title: t('error') + " " + t('delete') + " " + t('category'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`${t('confirmDeleteCategory')} "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const handlePreviewMenu = () => {
    if (restaurant) {
      window.open(`/menu/${restaurant.slug}`, '_blank');
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

  if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">{t('heroTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('noRestaurantDesc')}</p>
            <Button 
              onClick={() => {
                console.log('Create Restaurant button clicked');
                console.log('Before state change:', createRestaurantOpen);
                setCreateRestaurantOpen(true);
                console.log('After state change called');
              }}
              data-testid="button-create-restaurant"
            >
              {t('createRestaurant')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0 w-full">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 lg:px-6 py-4">
            <div className="pl-16 lg:pl-0"> {/* Space for mobile menu button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {restaurant?.name || t('loading')}
                  </h1>
                  <p className="text-gray-600">{t('menuManagement')}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviewMenu}
                    disabled={!restaurant}
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="mr-2" size={16} />
                    <span className="hidden sm:inline">{t('previewMenu')}</span>
                    <span className="sm:hidden">{t('previewMenu')}</span>
                  </Button>
                  
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          <User size={16} className="mr-2" />
                          <span className="hidden sm:inline">{user?.name || user?.email || 'User'}</span>
                          <ChevronDown size={16} className="ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                          <Settings size={16} className="mr-2" />
                          {t('settings')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                          <LogOut size={16} className="mr-2" />
                          {t('logOut')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-4 lg:p-6">
          <EmailVerificationBanner />
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{t('categoriesAndDishes')}</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button onClick={() => setAddCategoryOpen(true)} className="w-full sm:w-auto">
                  <Plus className="mr-2" size={16} />
                  <span className="hidden sm:inline">{t('addCategory')}</span>
                  <span className="sm:hidden">{t('category')}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddDish()}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2" size={16} />
                  <span className="hidden sm:inline">{t('addDish')}</span>
                  <span className="sm:hidden">{t('dish')}</span>
                </Button>
              </div>
            </div>
          </div>
          
          {restaurant ? (
            <div className="space-y-6">
              {/* Favorites Section */}
              {restaurant.categories.some(cat => cat.dishes.some(dish => dish.isFavorite)) && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        ⭐ {restaurant.favoritesTitle || t('favorites')}
                        <Badge variant="secondary" className="ml-2">
                          {restaurant.categories.reduce((count, cat) => 
                            count + cat.dishes.filter(dish => dish.isFavorite).length, 0
                          )} {t('dishes')}
                        </Badge>
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditFavoritesTitleOpen(true)}
                      >
                        <Edit size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {restaurant.categories.map(category => 
                        category.dishes
                          .filter(dish => dish.isFavorite)
                          .map((dish) => (
                            <DishCard
                              key={dish.id}
                              dish={dish}
                              currency={restaurant.currency}
                              restaurantId={selectedRestaurant}
                              showActions={true}
                              onEdit={handleEditDish}
                              onDelete={handleDeleteDish}
                            />
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {restaurant.categories.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <h3 className="text-lg font-semibold mb-2">{t('createFirstCategory')}</h3>
                    <p className="text-gray-600 mb-4">
                      {t('startByCategoryDesc')}
                    </p>
                    <Button onClick={() => setAddCategoryOpen(true)}>
                      <Plus className="mr-2" size={16} />
                      {t('addCategory')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                restaurant.categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          {category.icon} {category.name}
                          <Badge variant="secondary" className="ml-2">
                            {category.dishes.length} блюд
                          </Badge>
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {category.dishes.length === 0 ? (
                        <Button
                          variant="outline"
                          className="w-full border-dashed"
                          onClick={() => handleAddDish(category.id)}
                        >
                          <Plus className="mr-2" size={16} />
                          {t('addDishToCategory')} "{category.name}"
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          {category.dishes.map((dish) => (
                            <DishCard
                              key={dish.id}
                              dish={dish}
                              currency={restaurant.currency}
                              restaurantId={selectedRestaurant}
                              showActions={true}
                              onEdit={handleEditDish}
                              onDelete={handleDeleteDish}
                            />
                          ))}
                          
                          <Button
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => handleAddDish(category.id)}
                          >
                            <Plus className="mr-2" size={16} />
                            {t('addAnotherDish')}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('selectRestaurantToManage')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedRestaurant && (
        <>
          <AddCategoryModal
            open={addCategoryOpen}
            onOpenChange={setAddCategoryOpen}
            restaurantId={selectedRestaurant}
          />
          
          <AddDishModal
            open={addDishOpen}
            onOpenChange={setAddDishOpen}
            categories={restaurant?.categories || []}
            selectedCategoryId={selectedCategoryId}
            restaurantId={selectedRestaurant}
          />
          
          <EditDishModal
            open={editDishOpen}
            onOpenChange={setEditDishOpen}
            categories={restaurant?.categories || []}
            dish={selectedDish}
            restaurantId={selectedRestaurant}
          />
          
          <EditCategoryModal
            open={editCategoryOpen}
            onOpenChange={setEditCategoryOpen}
            category={selectedCategory}
            restaurantId={selectedRestaurant}
          />

          <EditFavoritesTitleModal
            open={editFavoritesTitleOpen}
            onOpenChange={setEditFavoritesTitleOpen}
            restaurantId={selectedRestaurant}
            currentTitle={restaurant?.favoritesTitle || "Избранное"}
          />
        </>
      )}

      {/* Inline Modal */}
      {createRestaurantOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setCreateRestaurantOpen(false)}
        >
          <div 
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Create Restaurant</h2>
            <p className="mb-4">Modal is working! State: {createRestaurantOpen.toString()}</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const name = formData.get('name') as string;
              if (!name) return;
              
              fetch('/api/restaurants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, currency: 'EUR', language: 'en' })
              })
              .then(res => res.json())
              .then(() => {
                toast({ title: 'Success', description: 'Restaurant created!' });
                queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
                setCreateRestaurantOpen(false);
              })
              .catch(err => {
                toast({ title: 'Error', description: err.message, variant: 'destructive' });
              });
            }}>
              <input
                name="name"
                type="text"
                placeholder="Restaurant name"
                className="w-full p-2 border rounded mb-4"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateRestaurantOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

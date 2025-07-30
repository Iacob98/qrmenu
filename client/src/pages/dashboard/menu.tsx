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
import { DishCard } from "@/components/menu/dish-card";
import { Plus, ExternalLink, User, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { RestaurantWithCategories, Dish, Category } from "@shared/schema";

export default function MenuManagement() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [addDishOpen, setAddDishOpen] = useState(false);
  const [editDishOpen, setEditDishOpen] = useState(false);
  const [editCategoryOpen, setEditCategoryOpen] = useState(false);
  const [createRestaurantOpen, setCreateRestaurantOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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
      toast({ title: "Блюдо удалено" });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка удаления блюда",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteDish = (dish: Dish) => {
    if (confirm(`Вы уверены, что хотите удалить блюдо "${dish.name}"?`)) {
      deleteDishMutation.mutate(dish.id);
    }
  };

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return await apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast({ title: "Категория удалена" });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка удаления категории",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteCategory = (category: Category) => {
    if (confirm(`Вы уверены, что хотите удалить категорию "${category.name}" и все блюда в ней?`)) {
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
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!restaurants || !Array.isArray(restaurants) || restaurants.length === 0) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Добро пожаловать!</h2>
            <p className="text-gray-600 mb-6">У вас пока нет ресторанов. Создайте первый.</p>
            <Button onClick={() => setCreateRestaurantOpen(true)}>
              Создать ресторан
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="flex-1">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {restaurant?.name || "Загрузка..."}
              </h1>
              <p className="text-gray-600">Управление меню</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handlePreviewMenu}
                disabled={!restaurant}
              >
                <ExternalLink className="mr-2" size={16} />
                Предпросмотр меню
              </Button>
              
              <div className="relative">
                <Button variant="outline" size="icon">
                  <User size={20} />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Категории и блюда</h2>
              <div className="flex space-x-3">
                <Button onClick={() => setAddCategoryOpen(true)}>
                  <Plus className="mr-2" size={16} />
                  Добавить категорию
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddDish()}
                >
                  <Plus className="mr-2" size={16} />
                  Добавить блюдо
                </Button>
              </div>
            </div>
          </div>
          
          {restaurant ? (
            <div className="space-y-6">
              {restaurant.categories.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <h3 className="text-lg font-semibold mb-2">Создайте первую категорию</h3>
                    <p className="text-gray-600 mb-4">
                      Начните с создания категорий блюд, например "Супы", "Горячее", "Десерты"
                    </p>
                    <Button onClick={() => setAddCategoryOpen(true)}>
                      <Plus className="mr-2" size={16} />
                      Добавить категорию
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
                          Добавить блюдо в категорию "{category.name}"
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
                            Добавить ещё блюдо
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
              <p className="text-gray-600">Выберите ресторан для управления меню</p>
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
        </>
      )}

      {/* Create Restaurant Modal */}
      <CreateRestaurantModal
        open={createRestaurantOpen}
        onOpenChange={setCreateRestaurantOpen}
      />
    </div>
  );
}

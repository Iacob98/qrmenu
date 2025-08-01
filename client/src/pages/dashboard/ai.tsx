import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Camera, PenTool, Upload, Check, Settings, Loader2 } from "lucide-react";
import type { Restaurant } from "@shared/schema";

interface AIGeneratedDish {
  name: string;
  description: string;
  price: number;
  ingredients: string[];
  nutrition?: {
    protein: number;
    fat: number;
    carbs: number;
    calories: number;
  };
  tags: string[];
  category?: string;
}

interface AIGeneratedCategory {
  name: string;
  icon?: string;
}

interface AIMenuResult {
  categories: AIGeneratedCategory[];
  dishes: AIGeneratedDish[];
}

export default function AIGeneration() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [activeTab, setActiveTab] = useState("pdf");
  const [textInput, setTextInput] = useState("");
  const [generatedDishes, setGeneratedDishes] = useState<AIGeneratedDish[]>([]);
  const [generatedCategories, setGeneratedCategories] = useState<AIGeneratedCategory[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user restaurants
  const { data: restaurants, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["/api/restaurants"],
  });

  // Get selected restaurant
  const { data: restaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", selectedRestaurant],
    enabled: !!selectedRestaurant,
  });

  // Auto-select first restaurant
  useEffect(() => {
    if (restaurants && Array.isArray(restaurants) && restaurants.length > 0 && !selectedRestaurant) {
      setSelectedRestaurant(restaurants[0].id);
    }
  }, [restaurants, selectedRestaurant]);

  const analyzeTextMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/ai/analyze-text", {
        restaurantId: selectedRestaurant,
        text,
      });
      return response.json();
    },
    onSuccess: (data: AIMenuResult) => {
      setGeneratedDishes(data.dishes || []);
      setGeneratedCategories(data.categories || []);
      toast({
        title: "Анализ завершён",
        description: `Найдено ${data.dishes?.length || 0} блюд и ${data.categories?.length || 0} категорий`,
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка анализа",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSelectedDishesMutation = useMutation({
    mutationFn: async (dishes: AIGeneratedDish[]) => {
      const restaurantData = await fetch(`/api/restaurants/${selectedRestaurant}`, {
        credentials: "include",
      }).then(r => r.json());
      
      // Step 1: Create categories if they don't exist
      const categoryMap = new Map<string, string>(); // category name -> category id
      
      // Add existing categories to map
      if (restaurantData.categories) {
        for (const category of restaurantData.categories) {
          categoryMap.set(category.name, category.id);
        }
      }
      
      // Create new categories for generated categories that don't exist yet
      for (const genCategory of generatedCategories) {
        if (!categoryMap.has(genCategory.name)) {
          const response = await apiRequest("POST", `/api/restaurants/${selectedRestaurant}/categories`, {
            name: genCategory.name,
            icon: genCategory.icon || null,
          });
          const newCategory = await response.json();
          categoryMap.set(genCategory.name, newCategory.id);
        }
      }
      
      // Step 2: Add dishes to their respective categories
      const promises = dishes.map(dish => {
        let categoryId;
        
        if (dish.category && categoryMap.has(dish.category)) {
          // Use the category specified by AI
          categoryId = categoryMap.get(dish.category);
        } else if (restaurantData.categories?.length > 0) {
          // Fallback to first existing category
          categoryId = restaurantData.categories[0].id;
        } else {
          throw new Error("Нет доступных категорий для добавления блюд");
        }
        
        return apiRequest("POST", `/api/categories/${categoryId}/dishes`, {
          name: dish.name,
          description: dish.description,
          price: dish.price.toString(),
          ingredients: dish.ingredients,
          tags: dish.tags,
          nutrition: dish.nutrition,
        });
      });

      return Promise.all(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
      toast({
        title: "Успешно добавлено",
        description: `${results.length} блюд добавлено в меню`,
      });
      setGeneratedDishes([]);
      setGeneratedCategories([]);
      setSelectedDishes(new Set());
    },
    onError: (error) => {
      toast({
        title: "Ошибка добавления",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeText = () => {
    if (!textInput.trim() || !selectedRestaurant) return;
    analyzeTextMutation.mutate(textInput);
  };

  const handleFileUpload = (type: 'pdf' | 'photo') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'pdf' ? '.pdf' : 'image/*';
    input.multiple = type === 'photo'; // Allow multiple images for photo analysis
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      // For PDF, process single file
      if (type === 'pdf') {
        const file = files[0];
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const response = await apiRequest("POST", '/api/ai/analyze-pdf', {
              restaurantId: selectedRestaurant,
              base64Data: base64,
            });
            const data: AIMenuResult = await response.json();
            
            setGeneratedDishes(data.dishes || []);
            setGeneratedCategories(data.categories || []);
            toast({
              title: "Анализ PDF завершён",
              description: `Найдено ${data.dishes?.length || 0} блюд и ${data.categories?.length || 0} категорий`,
            });
          } catch (error: any) {
            toast({
              title: "Ошибка анализа PDF",
              description: error.message,
              variant: "destructive",
            });
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // For photos, process multiple files
      let allDishes: any[] = [];
      let processedCount = 0;
      
      toast({
        title: "Анализ начат",
        description: `Обрабатываем ${files.length} фото...`,
      });

      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = (reader.result as string).split(',')[1];
            const response = await apiRequest("POST", '/api/ai/analyze-photo', {
              restaurantId: selectedRestaurant,
              base64Image: base64,
            });
            const data: AIMenuResult = await response.json();
            
            allDishes = [...allDishes, ...(data.dishes || [])];
            processedCount++;
            
            if (processedCount === files.length) {
              // Remove duplicate dishes by name
              const uniqueDishes = allDishes.filter((dish, index, self) => 
                index === self.findIndex(d => d.name === dish.name)
              );
              
              setGeneratedDishes(uniqueDishes);
              // For photos, we'll collect categories from all analyzed photos
              setGeneratedCategories([]); // Categories from multiple photos might be inconsistent
              toast({
                title: "Анализ фото завершён",
                description: `Найдено ${uniqueDishes.length} уникальных блюд из ${files.length} фото`,
              });
            }
          } catch (error: any) {
            processedCount++;
            toast({
              title: "Ошибка анализа фото",
              description: `${file.name}: ${error.message}`,
              variant: "destructive",
            });
            
            if (processedCount === files.length && allDishes.length > 0) {
              const uniqueDishes = allDishes.filter((dish, index, self) => 
                index === self.findIndex(d => d.name === dish.name)
              );
              setGeneratedDishes(uniqueDishes);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const toggleDishSelection = (index: number) => {
    const newSelection = new Set(selectedDishes);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedDishes(newSelection);
  };

  const selectAllDishes = () => {
    if (selectedDishes.size === generatedDishes.length) {
      setSelectedDishes(new Set());
    } else {
      setSelectedDishes(new Set(generatedDishes.map((_, index) => index)));
    }
  };

  const addSelectedDishes = () => {
    const dishesToAdd = generatedDishes.filter((_, index) => selectedDishes.has(index));
    if (dishesToAdd.length === 0) return;
    addSelectedDishesMutation.mutate(dishesToAdd);
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

  const hasAIToken = restaurant?.aiToken;

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
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">ИИ генерация меню</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    {hasAIToken ? (
                      <span className="text-green-600">ИИ-токен активен ✅</span>
                    ) : (
                      <span className="text-red-600">ИИ недоступен ❌</span>
                    )}
                    <Button variant="link" size="sm" className="p-0 h-auto text-left sm:text-center">
                      <Settings size={16} className="mr-1" />
                      Изменить токен
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          {!hasAIToken ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold mb-2">ИИ-токен не настроен</h3>
                <p className="text-gray-600 mb-4">
                  Для использования ИИ-генерации необходимо добавить токен в настройках ресторана
                </p>
                <Button onClick={() => window.location.href = "/dashboard/settings"}>
                  Перейти в настройки
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Input */}
              <Card>
                <CardHeader>
                  <CardTitle>Создание блюд с помощью ИИ</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="pdf" className="flex items-center gap-2">
                        <FileText size={16} />
                        PDF
                      </TabsTrigger>
                      <TabsTrigger value="photo" className="flex items-center gap-2">
                        <Camera size={16} />
                        Фото
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <PenTool size={16} />
                        Текст
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pdf" className="mt-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FileText className="mx-auto text-4xl text-gray-400 mb-4" size={64} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Загрузите PDF меню
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Загрузите меню, скан или таблицу — мы найдём названия блюд, состав и цены
                        </p>
                        <Button onClick={() => handleFileUpload('pdf')}>
                          <Upload className="mr-2" size={16} />
                          Выбрать файл
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="photo" className="mt-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Camera className="mx-auto text-4xl text-gray-400 mb-4" size={64} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Сфотографируйте меню
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Загрузите одно или несколько фото меню — мы извлечём все блюда и их описания
                        </p>
                        <Button onClick={() => handleFileUpload('photo')}>
                          <Upload className="mr-2" size={16} />
                          Загрузить фото (можно несколько)
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-6">
                      <div className="space-y-4">
                        <Textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Вставьте список блюд, например:&#10;&#10;Борщ — 250мл. Сметана, мясо, свекла. 5.90€&#10;Цезарь — Курица, салат, сухарики. 8.50€"
                          className="min-h-[200px]"
                        />
                        <Button 
                          onClick={handleAnalyzeText}
                          disabled={!textInput.trim() || analyzeTextMutation.isPending}
                          className="w-full"
                        >
                          {analyzeTextMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 animate-spin" size={16} />
                              Анализируем...
                            </>
                          ) : (
                            "Проанализировать"
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Right Panel - Results */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Найденные блюда</CardTitle>
                      {generatedCategories.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Категории: {generatedCategories.map(cat => cat.icon ? `${cat.icon} ${cat.name}` : cat.name).join(', ')}
                        </p>
                      )}
                    </div>
                    {generatedDishes.length > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllDishes}
                        >
                          {selectedDishes.size === generatedDishes.length ? "Снять всё" : "Выбрать всё"}
                        </Button>
                        <Button
                          size="sm"
                          onClick={addSelectedDishes}
                          disabled={selectedDishes.size === 0 || addSelectedDishesMutation.isPending}
                        >
                          {addSelectedDishesMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 animate-spin" size={16} />
                              Добавляем...
                            </>
                          ) : (
                            `Добавить выбранные (${selectedDishes.size})`
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedDishes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>Загрузите файл или введите текст для анализа</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {generatedDishes.map((dish, index) => (
                        <Card 
                          key={index} 
                          className={`cursor-pointer transition-colors ${
                            selectedDishes.has(index) ? "ring-2 ring-primary" : ""
                          }`}
                          onClick={() => toggleDishSelection(index)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedDishes.has(index)}
                                    onChange={() => toggleDishSelection(index)}
                                    className="rounded border-gray-300"
                                  />
                                  <h4 className="font-semibold">{dish.name}</h4>
                                  {dish.category && (
                                    <Badge variant="outline" className="text-xs">
                                      {dish.category}
                                    </Badge>
                                  )}
                                  <span className="text-primary-600 font-bold">
                                    €{dish.price.toFixed(2)}
                                  </span>
                                </div>
                                
                                {dish.description && (
                                  <p className="text-gray-600 text-sm mb-2">
                                    {dish.description}
                                  </p>
                                )}
                                
                                {dish.ingredients && dish.ingredients.length > 0 && (
                                  <p className="text-gray-500 text-xs mb-2">
                                    Ингредиенты: {dish.ingredients.join(", ")}
                                  </p>
                                )}
                                
                                {dish.tags && dish.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {dish.tags.map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {dish.nutrition && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    БЖУ: {dish.nutrition.protein}г/{dish.nutrition.fat}г/{dish.nutrition.carbs}г
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

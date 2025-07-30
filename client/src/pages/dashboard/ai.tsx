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
}

export default function AIGeneration() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [activeTab, setActiveTab] = useState("pdf");
  const [textInput, setTextInput] = useState("");
  const [generatedDishes, setGeneratedDishes] = useState<AIGeneratedDish[]>([]);
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
    onSuccess: (data) => {
      setGeneratedDishes(data.dishes || []);
      toast({
        title: "Анализ завершён",
        description: `Найдено ${data.dishes?.length || 0} блюд`,
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
      // This would require implementing category selection
      // For now, add to first available category
      const restaurantData = await fetch(`/api/restaurants/${selectedRestaurant}`, {
        credentials: "include",
      }).then(r => r.json());
      
      if (!restaurantData.categories?.length) {
        throw new Error("Сначала создайте категорию для блюд");
      }

      const categoryId = restaurantData.categories[0].id;
      
      const promises = dishes.map(dish =>
        apiRequest("POST", `/api/categories/${categoryId}/dishes`, {
          name: dish.name,
          description: dish.description,
          price: dish.price.toString(),
          ingredients: dish.ingredients,
          tags: dish.tags,
          nutrition: dish.nutrition,
        })
      );

      return Promise.all(promises);
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", selectedRestaurant] });
      toast({
        title: "Успешно добавлено",
        description: `${results.length} блюд добавлено в меню`,
      });
      setGeneratedDishes([]);
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
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const endpoint = type === 'pdf' ? '/api/ai/analyze-pdf' : '/api/ai/analyze-photo';
          const payload = {
            restaurantId: selectedRestaurant,
            [type === 'pdf' ? 'base64Data' : 'base64Image']: base64,
          };

          const response = await apiRequest("POST", endpoint, payload);
          const data = await response.json();
          
          setGeneratedDishes(data.dishes || []);
          toast({
            title: "Анализ завершён",
            description: `Найдено ${data.dishes?.length || 0} блюд`,
          });
        } catch (error: any) {
          toast({
            title: "Ошибка анализа",
            description: error.message,
            variant: "destructive",
          });
        }
      };
      reader.readAsDataURL(file);
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
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const hasAIToken = restaurant?.aiToken;

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ИИ генерация меню</h1>
                <div className="flex items-center mt-1">
                  {hasAIToken ? (
                    <span className="text-green-600 mr-2">ИИ-токен активен ✅</span>
                  ) : (
                    <span className="text-red-600 mr-2">ИИ недоступен ❌</span>
                  )}
                  <Button variant="link" size="sm" className="p-0 h-auto">
                    <Settings size={16} className="mr-1" />
                    Изменить токен
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
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
            <div className="grid lg:grid-cols-2 gap-6">
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
                          Сфотографируйте бумажное меню — мы извлечём названия и описание блюд
                        </p>
                        <Button onClick={() => handleFileUpload('photo')}>
                          <Upload className="mr-2" size={16} />
                          Загрузить фото
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
                    <CardTitle>Найденные блюда</CardTitle>
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

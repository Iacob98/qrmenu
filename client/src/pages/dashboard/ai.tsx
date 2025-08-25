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
import { useTranslation } from "react-i18next";
import { FileText, Camera, PenTool, Upload, Check, Settings, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

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
        title: "Analysis completed",
        description: `Found ${data.dishes?.length || 0} dishes and ${data.categories?.length || 0} categories`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis error",
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
          throw new Error("No available categories to add dishes");
        }
        
        return apiRequest("POST", `/api/categories/${categoryId}/dishes`, {
          name: dish.name,
          description: dish.description,
          price: (dish.price || 0).toString(),
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
        title: "Successfully added",
        description: `${results.length} dishes added to menu`,
      });
      setGeneratedDishes([]);
      setGeneratedCategories([]);
      setSelectedDishes(new Set());
    },
    onError: (error) => {
      toast({
        title: "Adding error",
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
              title: "PDF analysis completed",
              description: `Found ${data.dishes?.length || 0} dishes and ${data.categories?.length || 0} categories`,
            });
          } catch (error: any) {
            toast({
              title: "PDF analysis error",
              description: error.message,
              variant: "destructive",
            });
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // For photos, process multiple files with progress tracking
      let allDishes: any[] = [];
      let allCategories: any[] = [];
      let processedCount = 0;
      
      setIsUploading(true);
      setUploadProgress({});
      
      toast({
        title: t('analysisStarted'),
        description: `${t('processingPhotos')}: ${files.length}`,
      });

      const processFile = async (file: File, index: number) => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 50); // 50% for file reading
              setUploadProgress(prev => ({ ...prev, [`file-${index}`]: progress }));
            }
          };
          
          reader.onload = async () => {
            try {
              // Set progress to 50% (file read complete)
              setUploadProgress(prev => ({ ...prev, [`file-${index}`]: 50 }));
              
              const base64 = (reader.result as string).split(',')[1];
              const response = await apiRequest("POST", '/api/ai/analyze-photo', {
                restaurantId: selectedRestaurant,
                base64Image: base64,
              });
              const data: AIMenuResult = await response.json();
              
              // Set progress to 100% (analysis complete)
              setUploadProgress(prev => ({ ...prev, [`file-${index}`]: 100 }));
              
              allDishes = [...allDishes, ...(data.dishes || [])];
              allCategories = [...allCategories, ...(data.categories || [])];
              processedCount++;
              
              if (processedCount === files.length) {
                // Remove duplicate dishes by name
                const uniqueDishes = allDishes.filter((dish, index, self) => 
                  index === self.findIndex(d => d.name === dish.name)
                );
                const uniqueCategories = allCategories.filter((cat, index, self) => 
                  index === self.findIndex(c => c.name === cat.name)
                );
                
                setGeneratedDishes(uniqueDishes);
                setGeneratedCategories(uniqueCategories);
                setIsUploading(false);
                setUploadProgress({});
                
                toast({
                  title: t('analysisCompleted'),
                  description: `${t('foundDishes')}: ${uniqueDishes.length}, ${t('foundCategories')}: ${uniqueCategories.length}`,
                });
              }
              resolve();
            } catch (error: any) {
              setUploadProgress(prev => ({ ...prev, [`file-${index}`]: -1 })); // Error state
              reject(error);
            }
          };
          
          reader.onerror = () => {
            setUploadProgress(prev => ({ ...prev, [`file-${index}`]: -1 }));
            reject(new Error('File reading failed'));
          };
          
          reader.readAsDataURL(file);
        });
      };

      try {
        await Promise.all(files.map((file, index) => processFile(file, index)));
      } catch (error: any) {
        setIsUploading(false);
        toast({
          title: t('analysisError'),
          description: error.message,
          variant: "destructive", 
        });
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

  // Always show AI as available since we have global tokens
  const hasAIToken = true;

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
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{t('aiTitle')}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    {hasAIToken ? (
                      <span className="text-green-600">{t('aiTokenActive')} ✅</span>
                    ) : (
                      <span className="text-red-600">{t('aiNotAvailable')} ❌</span>
                    )}
                    <Button variant="link" size="sm" className="p-0 h-auto text-left sm:text-center">
                      <Settings size={16} className="mr-1" />
                      {t('changeToken')}
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
                <h3 className="text-lg font-semibold mb-2">{t('aiTokenNotConfigured')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('aiTokenRequired')}
                </p>
                <Button onClick={() => window.location.href = "/dashboard/settings"}>
                  {t('goToSettings')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Input */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('createDishesWithAI')}</CardTitle>
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
                        {t('photo')}
                      </TabsTrigger>
                      <TabsTrigger value="text" className="flex items-center gap-2">
                        <PenTool size={16} />
                        {t('text')}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pdf" className="mt-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FileText className="mx-auto text-4xl text-gray-400 mb-4" size={64} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('uploadPDFMenu')}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {t('uploadPDFMenuDesc')}
                        </p>
                        <Button onClick={() => handleFileUpload('pdf')}>
                          <Upload className="mr-2" size={16} />
                          {t('chooseFile')}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="photo" className="mt-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Camera className="mx-auto text-4xl text-gray-400 mb-4" size={64} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {t('photoUploadTitle')}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {t('photoUploadDesc')}
                        </p>
                        
                        {/* Progress indicators */}
                        {isUploading && (
                          <div className="mb-4 space-y-2">
                            <div className="text-sm text-gray-600 mb-2">{t('uploadingFiles')}...</div>
                            {Object.entries(uploadProgress).map(([fileKey, progress]) => (
                              <div key={fileKey} className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{fileKey.replace('file-', t('file') + ' ')}</span>
                                  <span>
                                    {progress === -1 ? t('error') : 
                                     progress === 100 ? t('completed') : 
                                     progress < 50 ? t('uploading') : t('analyzing')}
                                  </span>
                                </div>
                                <Progress 
                                  value={progress === -1 ? 0 : progress} 
                                  className={`h-2 ${progress === -1 ? 'bg-red-100' : ''}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <Button 
                          onClick={() => handleFileUpload('photo')}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 animate-spin" size={16} />
                              {t('uploading')}...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2" size={16} />
                              {t('uploadPhotos')}
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-6">
                      <div className="space-y-4">
                        <Textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder={t('textAnalysisPlaceholder')}
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
                              {t('analyzing')}...
                            </>
                          ) : (
                            t('analyzeText')
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
                      <CardTitle>{t('foundDishes')}</CardTitle>
                      {generatedCategories.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t('categories')}: {generatedCategories.map(cat => cat.icon ? `${cat.icon} ${cat.name}` : cat.name).join(', ')}
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
                          {selectedDishes.size === generatedDishes.length ? t('deselectAll') : t('selectAll')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={addSelectedDishes}
                          disabled={selectedDishes.size === 0 || addSelectedDishesMutation.isPending}
                        >
                          {addSelectedDishesMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 animate-spin" size={16} />
                              {t('adding')}
                            </>
                          ) : (
                            `${t('addSelected')} (${selectedDishes.size})`
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedDishes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>{t('uploadOrEnterText')}</p>
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
                                    €{(dish.price || 0).toFixed(2)}
                                  </span>
                                </div>
                                
                                {dish.description && (
                                  <p className="text-gray-600 text-sm mb-2">
                                    {dish.description}
                                  </p>
                                )}
                                
                                {dish.ingredients && dish.ingredients.length > 0 && (
                                  <p className="text-gray-500 text-xs mb-2">
                                    {t('ingredients')}: {dish.ingredients.join(", ")}
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
                                    {t('nutrition')}: {dish.nutrition.protein}г/{dish.nutrition.fat}г/{dish.nutrition.carbs}г
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

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUpload } from "@/components/ui/file-upload";
import { useTranslation } from "react-i18next";
import type { Category, Dish } from "@shared/schema";

interface EditDishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  dish: Dish | null;
  restaurantId: string;
}

const availableTags = [
  "vegetarian",
  "vegan", 
  "spicy",
  "gluten-free",
  "dairy-free",
  "meat",
  "seafood",
  "nuts",
  "healthy",
  "popular",
];

export function EditDishModal({ 
  open, 
  onOpenChange, 
  categories, 
  dish,
  restaurantId
}: EditDishModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    ingredients: "",
    tags: [] as string[],
    image: "",
    imagePrompt: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
  });

  // Update form data when dish changes
  useEffect(() => {
    if (dish && open) {
      const nutrition = dish.nutrition as { calories?: number; protein?: number; fat?: number; carbs?: number } | null;
      setFormData({
        name: dish.name,
        description: dish.description || "",
        price: dish.price.toString(),
        categoryId: dish.categoryId,
        ingredients: dish.ingredients?.join(", ") || "",
        tags: dish.tags || [],
        image: dish.image || "",
        imagePrompt: "",
        calories: nutrition?.calories?.toString() || "",
        protein: nutrition?.protein?.toString() || "",
        fat: nutrition?.fat?.toString() || "",
        carbs: nutrition?.carbs?.toString() || "",
      });
    }
  }, [dish, open]);

  const updateDishMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!dish) throw new Error("No dish to update");
      return await apiRequest("PUT", `/api/dishes/${dish.id}`, data);
    },
    onSuccess: () => {
      toast({ title: t('dishUpdated') });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t('updateDishError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: async ({ dishName, description, ingredients, tags, imagePrompt }: { 
      dishName: string; 
      description: string;
      ingredients?: string[];
      tags?: string[];
      imagePrompt?: string;
    }) => {
      if (!dish?.id) throw new Error("Dish ID is required for image generation");
      const response = await apiRequest("POST", `/api/ai/generate-image`, { 
        restaurantId, 
        dishId: dish.id,
        categoryId: dish.categoryId,
        dishName, 
        description,
        ingredients,
        tags,
        imagePrompt
      });
      return await response.json();
    },
    onSuccess: (response: any) => {
      console.log('[Generated Image] Response:', response);
      const imageUrl = response?.imageUrl;
      const remainingGenerations = response?.remainingGenerations;
      
      if (imageUrl) {
        // Update the form data with the generated image
        setFormData(prev => ({ ...prev, image: imageUrl }));
        
        let toastMessage = t('photoGenerated');
        if (typeof remainingGenerations === 'number') {
          toastMessage += ` (${remainingGenerations}/5 remaining)`;
        }
        
        toast({ title: toastMessage });
        console.log('[Generated Image] URL:', imageUrl);
      } else {
        toast({
          title: t('error'),
          description: t('failedToGetImageUrl'),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('photoGenerationError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const improveDescriptionMutation = useMutation({
    mutationFn: async ({ dishName, currentDescription, ingredients, tags }: { 
      dishName: string; 
      currentDescription: string;
      ingredients?: string[];
      tags?: string[];
    }) => {
      const response = await apiRequest("POST", `/api/ai/improve-description`, { 
        restaurantId, 
        dishName, 
        currentDescription,
        ingredients,
        tags
      });
      return await response.json();
    },
    onSuccess: (response: any) => {
      const improvedDescription = response?.improvedDescription;
      if (improvedDescription) {
        setFormData(prev => ({ ...prev, description: improvedDescription }));
        toast({ title: t('descriptionImproved') });
      } else {
        toast({
          title: t('error'),
          description: t('failedToImproveDescription'),
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: t('improveDescriptionError'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateImage = () => {
    if (!formData.name.trim()) {
      toast({
        title: t('enterDishName'),
        variant: "destructive",
      });
      return;
    }
    const ingredients = formData.ingredients
      .split(",")
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);
      
    generateImageMutation.mutate({
      dishName: formData.name,
      description: formData.description,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      imagePrompt: formData.imagePrompt.trim() || undefined,
    });
  };

  const handleImproveDescription = () => {
    if (!formData.name.trim()) {
      toast({
        title: t('enterDishName'),
        variant: "destructive",
      });
      return;
    }
    
    const ingredients = formData.ingredients
      .split(",")
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);
      
    improveDescriptionMutation.mutate({
      dishName: formData.name,
      currentDescription: formData.description,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.categoryId) return;

    const ingredients = formData.ingredients
      .split(",")
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    // Build nutrition object if any values provided
    const hasNutrition = formData.calories || formData.protein || formData.fat || formData.carbs;
    const nutrition = hasNutrition ? {
      calories: formData.calories ? parseFloat(formData.calories) : 0,
      protein: formData.protein ? parseFloat(formData.protein) : 0,
      fat: formData.fat ? parseFloat(formData.fat) : 0,
      carbs: formData.carbs ? parseFloat(formData.carbs) : 0,
    } : null;

    updateDishMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      ingredients: ingredients.length > 0 ? ingredients : null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      image: formData.image || null,
      nutrition,
    });
  };

  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (!dish) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>{t('editDish')}: {dish.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('dishName')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('dishNamePlaceholder')}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">{t('price')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="5.90"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">{t('category')}</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImproveDescription}
                disabled={improveDescriptionMutation.isPending || !formData.name.trim()}
                className="text-xs"
              >
                {improveDescriptionMutation.isPending ? (
                  t('improving')
                ) : (
                  t('improveWithAI')
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="ingredients">{t('ingredients')} ({t('separated')})</Label>
            <Input
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              placeholder={t('ingredientsPlaceholder')}
            />
          </div>

          {/* Nutrition Section */}
          <div>
            <Label>{t('nutritionInfo')}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              <div>
                <Label htmlFor="edit-calories" className="text-xs text-muted-foreground">{t('calories')}</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  step="1"
                  min="0"
                  value={formData.calories}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                  placeholder="250"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit-protein" className="text-xs text-muted-foreground">{t('protein')} (г)</Label>
                <Input
                  id="edit-protein"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.protein}
                  onChange={(e) => setFormData(prev => ({ ...prev, protein: e.target.value }))}
                  placeholder="15"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit-fat" className="text-xs text-muted-foreground">{t('fat')} (г)</Label>
                <Input
                  id="edit-fat"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.fat}
                  onChange={(e) => setFormData(prev => ({ ...prev, fat: e.target.value }))}
                  placeholder="10"
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="edit-carbs" className="text-xs text-muted-foreground">{t('carbs')} (г)</Label>
                <Input
                  id="edit-carbs"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData(prev => ({ ...prev, carbs: e.target.value }))}
                  placeholder="30"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>{t('tags')}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableTags
                .filter(tag => !formData.tags.includes(tag))
                .map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    className="text-xs"
                  >
                    + {tag}
                  </Button>
                ))}
            </div>
          </div>

          <div>
            <FileUpload
              key={formData.image || 'no-image'} // Force re-render when image changes
              label={`🖼️ ${t('dishPhoto')}`}
              value={formData.image}
              onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
              endpoint="image"
              width={350}
              height={180}
              maxSize={8}
              hideUrlInput={true}
              isGenerating={generateImageMutation.isPending}
            />
            <div className="mt-2 space-y-2">
              <div>
                <Label htmlFor="imagePrompt">🎨 Custom Image Prompt</Label>
                <Textarea
                  id="imagePrompt"
                  value={formData.imagePrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, imagePrompt: e.target.value }))}
                  placeholder="Additional details: serving style, background, lighting, presentation... (optional)"
                  rows={2}
                  className="text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateImage}
                disabled={generateImageMutation.isPending || !formData.name.trim() || !dish}
                className="w-full"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {generateImageMutation.isPending ? t('generating') : t('generateAIPhoto')}
              </Button>
              {dish && dish.imageGenerationsCount !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  Generations used: {dish.imageGenerationsCount || 0}/5
                  {dish.imageGenerationsCount && dish.imageGenerationsCount >= 5 && (
                    <span className="text-red-600 ml-2">⚠️ Limit reached</span>
                  )}
                </p>
              )}
            </div>
            {formData.image && (
              <div className="mt-2 text-sm text-muted-foreground">
                {t('currentImage')}: {formData.image}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={updateDishMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateDishMutation.isPending ? t('updating') : t('update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
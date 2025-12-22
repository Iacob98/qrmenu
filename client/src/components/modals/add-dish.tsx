import { useState } from "react";
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
import { X, Upload, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FileUpload } from "@/components/ui/file-upload";
import { useTranslation } from "react-i18next";
import type { Category } from "@shared/schema";

interface AddDishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedCategoryId?: string;
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

export function AddDishModal({ 
  open, 
  onOpenChange, 
  categories, 
  selectedCategoryId,
  restaurantId 
}: AddDishModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: selectedCategoryId || "",
    ingredients: "",
    tags: [] as string[],
    image: "",
    calories: "",
    protein: "",
    fat: "",
    carbs: "",
  });
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const createDishMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/categories/${data.categoryId}/dishes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: t('success'),
        description: t('dishCreated'),
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: selectedCategoryId || "",
      ingredients: "",
      tags: [],
      image: "",
      calories: "",
      protein: "",
      fat: "",
      carbs: "",
    });
  };

  const generateImageMutation = useMutation({
    mutationFn: async ({ dishName, description, ingredients, tags }: { 
      dishName: string; 
      description: string;
      ingredients?: string[];
      tags?: string[];
    }) => {
      const response = await apiRequest("POST", `/api/ai/generate-image`, { 
        restaurantId, 
        dishName, 
        description,
        ingredients,
        tags
      });
      return await response.json();
    },
    onSuccess: (response: any) => {
      console.log('[Generated Image] Response:', response);
      const imageUrl = response?.imageUrl;
      if (imageUrl) {
        setFormData(prev => ({ ...prev, image: imageUrl }));
        toast({ title: t('photoGenerated') });
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
    } : undefined;

    createDishMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      image: formData.image || undefined,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>{t('addDish')}</DialogTitle>
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
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('descriptionPlaceholder')}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="ingredients">{t('ingredients')}</Label>
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
                <Label htmlFor="calories" className="text-xs text-muted-foreground">{t('calories')}</Label>
                <Input
                  id="calories"
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
                <Label htmlFor="protein" className="text-xs text-muted-foreground">{t('protein')} (г)</Label>
                <Input
                  id="protein"
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
                <Label htmlFor="fat" className="text-xs text-muted-foreground">{t('fat')} (г)</Label>
                <Input
                  id="fat"
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
                <Label htmlFor="carbs" className="text-xs text-muted-foreground">{t('carbs')} (г)</Label>
                <Input
                  id="carbs"
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

          {/* Photo Section */}
          <div>
            <FileUpload
              key={formData.image || 'no-image'} // Force re-render when image changes
              label={t('dishPhoto')}
              value={formData.image}
              onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
              endpoint="image"
              width={350}
              height={180}
              maxSize={8}
              hideUrlInput={true}
              isGenerating={generateImageMutation.isPending}
            />
            <div className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateImage}
                disabled={generateImageMutation.isPending || !formData.name.trim()}
                className="w-full"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {generateImageMutation.isPending ? t('generating') : t('generateAIPhoto')}
              </Button>
            </div>
            {formData.image && (
              <div className="mt-2 text-sm text-muted-foreground">
                {t('currentImage')} {formData.image}
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
              disabled={createDishMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createDishMutation.isPending ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

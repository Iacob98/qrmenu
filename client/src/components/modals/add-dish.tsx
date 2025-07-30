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
  });
  
  const [imageGenerating, setImageGenerating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDishMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/categories/${data.categoryId}/dishes`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: "Успешно",
        description: "Блюдо создано",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
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
    });
  };

  const generateImageMutation = useMutation({
    mutationFn: async ({ dishName, description }: { dishName: string; description: string }) => {
      return await apiRequest("POST", `/api/ai/generate-image`, { 
        restaurantId, 
        dishName, 
        description 
      });
    },
    onSuccess: (data: any) => {
      setFormData(prev => ({ ...prev, image: data.imageUrl }));
      toast({ title: "Фото сгенерировано" });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка генерации фото",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateImage = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Введите название блюда",
        variant: "destructive",
      });
      return;
    }
    generateImageMutation.mutate({
      dishName: formData.name,
      description: formData.description,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.categoryId) return;

    const ingredients = formData.ingredients
      .split(",")
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    createDishMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseFloat(formData.price),
      categoryId: formData.categoryId,
      ingredients: ingredients.length > 0 ? ingredients : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      image: formData.image || undefined,
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Добавить блюдо</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Название блюда</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Борщ украинский"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="price">Цена</Label>
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
            <Label htmlFor="category">Категория</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
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
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Традиционный украинский борщ с говядиной, свеклой и сметаной"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="ingredients">Ингредиенты (через запятую)</Label>
            <Input
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              placeholder="Говядина, свекла, капуста, морковь, сметана"
            />
          </div>
          
          <div>
            <Label>Теги</Label>
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
            <div className="flex flex-wrap gap-2">
              {availableTags
                .filter(tag => !formData.tags.includes(tag))
                .map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                  >
                    + {tag}
                  </Button>
                ))}
            </div>
          </div>

          {/* Photo Section */}
          <div>
            <Label>Фото блюда</Label>
            <div className="mt-2 space-y-2">
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image} 
                    alt="Фото блюда" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Пока нет фото блюда
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateImage}
                  disabled={generateImageMutation.isPending || !formData.name.trim()}
                  className="flex-1"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  {generateImageMutation.isPending ? "Генерирую..." : "Сгенерировать ИИ"}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={createDishMutation.isPending}
            >
              {createDishMutation.isPending ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

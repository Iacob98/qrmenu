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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

interface EditCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  restaurantId: string;
}

const categoryIcons = [
  "🍽️", "🥗", "🍲", "🍖", "🍕", "🍝", "🍱", "🍤", 
  "🥘", "🍛", "🥙", "🌮", "🍔", "🍟", "🥞", "🧀",
  "🍰", "🧁", "🍦", "☕", "🍷", "🍺", "🥤", "🧃"
];

export function EditCategoryModal({ 
  open, 
  onOpenChange, 
  category,
  restaurantId
}: EditCategoryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    icon: "🍽️",
  });

  // Update form data when category changes
  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name,
        icon: category.icon || "🍽️",
      });
    }
  }, [category, open]);

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!category) throw new Error("No category to update");
      return await apiRequest("PUT", `/api/categories/${category.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Категория обновлена" });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка обновления категории",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    updateCategoryMutation.mutate({
      name: formData.name.trim(),
      icon: formData.icon,
    });
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Редактировать категорию: {category.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название категории</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Например: Супы, Горячее, Десерты"
              required
            />
          </div>
          
          <div>
            <Label>Иконка</Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2 max-h-32 overflow-y-auto">
              {categoryIcons.map((icon) => (
                <Button
                  key={icon}
                  type="button"
                  variant={formData.icon === icon ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className="w-12 h-12 text-lg"
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={updateCategoryMutation.isPending}
              className="w-full sm:w-auto"
            >
              {updateCategoryMutation.isPending ? "Обновление..." : "Обновить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
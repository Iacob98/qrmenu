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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
}

export function AddCategoryModal({ open, onOpenChange, restaurantId }: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; icon?: string; restaurantId: string }) => {
      const response = await apiRequest("POST", `/api/restaurants/${restaurantId}/categories`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: "Успешно",
        description: "Категория создана",
      });
      onOpenChange(false);
      setName("");
      setIcon("");
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCategoryMutation.mutate({
      name: name.trim(),
      icon: icon.trim() || undefined,
      restaurantId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>Добавить категорию</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название категории</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Супы, Горячее, Десерты"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="icon">Иконка (опционально)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="🍲"
            />
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
              disabled={createCategoryMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createCategoryMutation.isPending ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

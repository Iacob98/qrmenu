import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EditFavoritesTitleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  currentTitle: string;
}

export function EditFavoritesTitleModal({
  open,
  onOpenChange,
  restaurantId,
  currentTitle,
}: EditFavoritesTitleModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, open]);

  const updateTitleMutation = useMutation({
    mutationFn: async (favoritesTitle: string) => {
      return await apiRequest(`/api/restaurants/${restaurantId}/favorites-title`, "PATCH", { favoritesTitle });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Успешно!",
        description: "Название раздела избранного обновлено",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить название",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      updateTitleMutation.mutate(title.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Изменить название раздела избранного</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название раздела</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Хиты, Рекомендуем, Любимое..."
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={updateTitleMutation.isPending || !title.trim()}
            >
              {updateTitleMutation.isPending ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
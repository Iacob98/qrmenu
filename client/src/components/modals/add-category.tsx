import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; icon?: string; restaurantId: string }) => {
      const response = await apiRequest("POST", `/api/restaurants/${restaurantId}/categories`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: t('success'),
        description: t('categoryCreated'),
      });
      onOpenChange(false);
      setName("");
      setIcon("");
    },
    onError: (error) => {
      toast({
        title: t('error'),
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
          <DialogTitle>{t('addCategory')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('categoryName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('categoryNamePlaceholder')}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="icon">{t('iconOptional')}</Label>
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
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={createCategoryMutation.isPending}
              className="w-full sm:w-auto"
            >
              {createCategoryMutation.isPending ? t('creating') : t('create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

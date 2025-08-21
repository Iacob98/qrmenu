import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Dish } from "@shared/schema";

interface DishActionsProps {
  dish: Dish;
  restaurantId: string;
}

export function DishActions({ dish, restaurantId }: DishActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (isFavorite: boolean) => {
      const response = await apiRequest("PATCH", `/api/dishes/${dish.id}/favorite`, { isFavorite });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: dish.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${dish.name} ${dish.isFavorite ? "removed from" : "added to"} favorites`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async (isHidden: boolean) => {
      const response = await apiRequest("PATCH", `/api/dishes/${dish.id}/visibility`, { isHidden });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants", restaurantId] });
      toast({
        title: dish.isHidden ? "Dish shown" : "Dish hidden",
        description: `${dish.name} ${dish.isHidden ? "is now visible" : "is hidden"} in public menu`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleFavorite = () => {
    toggleFavoriteMutation.mutate(!dish.isFavorite);
  };

  const handleToggleVisibility = () => {
    toggleVisibilityMutation.mutate(!dish.isHidden);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleFavorite}
        disabled={toggleFavoriteMutation.isPending}
        className={dish.isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}
      >
        <Heart className={`h-4 w-4 ${dish.isFavorite ? "fill-current" : ""}`} />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleVisibility}
        disabled={toggleVisibilityMutation.isPending}
        className={dish.isHidden ? "text-gray-400 hover:text-green-500" : "text-green-500 hover:text-gray-400"}
      >
        {dish.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}
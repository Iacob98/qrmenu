import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Info, Utensils, Heart, Eye, EyeOff } from "lucide-react";
import { DishActions } from "@/components/dish/dish-actions";
import type { Dish } from "@shared/schema";

interface DishCardProps {
  dish: Dish;
  currency: string;
  restaurantId?: string;
  onEdit?: (dish: Dish) => void;
  onDelete?: (dish: Dish) => void;
  onFilterByTag?: (tag: string) => void;
  onShowDetails?: (dish: Dish) => void;
  showActions?: boolean;
  showDetails?: boolean;
}

export function DishCard({ 
  dish, 
  currency,
  restaurantId,
  onEdit, 
  onDelete, 
  onFilterByTag,
  onShowDetails, 
  showActions = true,
  showDetails = false
}: DishCardProps) {
  const tagColors: Record<string, string> = {
    "vegetarian": "bg-green-100 text-green-700 hover:bg-green-200",
    "vegan": "bg-green-100 text-green-700 hover:bg-green-200",
    "spicy": "bg-red-100 text-red-700 hover:bg-red-200",
    "gluten-free": "bg-blue-100 text-blue-700 hover:bg-blue-200",
    "dairy-free": "bg-purple-100 text-purple-700 hover:bg-purple-200",
    "meat": "bg-orange-100 text-orange-700 hover:bg-orange-200",
  };

  const getTagEmoji = (tag: string) => {
    const emojis: Record<string, string> = {
      "vegetarian": "🥦",
      "vegan": "🌱",
      "spicy": "🌶️",
      "gluten-free": "🌾",
      "dairy-free": "🥛",
      "meat": "🥩",
    };
    return emojis[tag] || "🏷️";
  };

  return (
    <Card className="p-4 card-hover">
      <div className="flex items-start space-x-4">
        {/* Dish Image */}
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
          {dish.image ? (
            <img 
              src={dish.image} 
              alt={dish.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <Utensils className="text-primary-500 text-xl" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <h3 className={`font-semibold ${dish.isHidden ? 'text-gray-400' : 'text-gray-900'}`}>
                {dish.name}
              </h3>
              {dish.isFavorite && <Heart className="h-4 w-4 text-red-500 fill-current" />}
              {dish.isHidden && <EyeOff className="h-4 w-4 text-gray-400" />}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-primary-600 font-bold ml-2">
                {currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "PLN" ? "zł" : ""}
                {dish.price}
              </span>
              {showActions && restaurantId && (
                <div className="flex space-x-1">
                  <DishActions dish={dish} restaurantId={restaurantId} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(dish)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(dish)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {dish.description && (
            <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
          )}
          
          {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {dish.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`text-xs cursor-pointer transition-colors ${tagColors[tag] || "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  onClick={() => onFilterByTag?.(tag)}
                >
                  {getTagEmoji(tag)} {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {showDetails && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:text-primary-700 p-0"
              onClick={() => onShowDetails?.(dish)}
            >
              <Info size={16} className="mr-1" />
              Подробнее
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

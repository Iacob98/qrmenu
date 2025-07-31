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
    <Card 
      className="card-hover"
      style={{
        borderRadius: 'var(--card-radius, 8px)',
        fontFamily: 'var(--font-family, inherit)',
        fontSize: 'var(--font-size, inherit)',
        backgroundColor: 'var(--card-background, #ffffff)'
      }}
    >
      <div className="flex items-center space-x-3 p-3">
        {/* Dish Image - smaller and round */}
        <div 
          className="w-12 h-12 bg-gray-200 flex-shrink-0 rounded-lg overflow-hidden"
        >
          {dish.image ? (
            <img 
              src={dish.image} 
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <Utensils className="text-primary-500" size={18} />
            </div>
          )}
        </div>
        
        {/* Content - left aligned */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-semibold text-base truncate ${dish.isHidden ? 'text-gray-400' : 'text-gray-900'}`}>
                  {dish.name}
                </h3>
                {dish.isFavorite && <Heart className="h-3 w-3 text-red-500 fill-current flex-shrink-0" />}
                {dish.isHidden && <EyeOff className="h-3 w-3 text-gray-400 flex-shrink-0" />}
              </div>
              
              {dish.description && (
                <p className="text-gray-600 text-sm line-clamp-1 mb-2">{dish.description}</p>
              )}
              
              {/* Tags - only show first 2 */}
              {dish.tags && dish.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {dish.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`text-xs cursor-pointer transition-colors ${tagColors[tag] || "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      onClick={() => onFilterByTag?.(tag)}
                    >
                      {getTagEmoji(tag)} {tag}
                    </Badge>
                  ))}
                  {dish.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dish.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {/* Price - right side */}
            <div className="flex flex-col items-end space-y-2 ml-3">
              <span className="text-primary-600 font-bold text-base flex-shrink-0">
                {currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "PLN" ? "zł" : ""}
                {dish.price}
              </span>
              
              {/* Actions */}
              {showActions && restaurantId && (
                <div className="flex space-x-1">
                  <DishActions dish={dish} restaurantId={restaurantId} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(dish)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(dish)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
              
              {showDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-600 hover:text-primary-700 text-xs"
                  onClick={() => onShowDetails?.(dish)}
                >
                  <Info size={14} className="mr-1" />
                  Подробнее
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

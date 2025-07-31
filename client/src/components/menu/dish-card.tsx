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
      className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
      style={{
        borderRadius: 'var(--card-radius, 12px)',
        fontFamily: 'var(--font-family, inherit)',
        fontSize: 'var(--font-size, inherit)',
        backgroundColor: 'var(--card-background, #ffffff)'
      }}
      onClick={() => showDetails && onShowDetails?.(dish)}
    >
      <div className="flex items-start space-x-3 p-3">
        {/* Compact Image */}
        <div className="w-16 h-16 bg-gray-100 flex-shrink-0 rounded-lg overflow-hidden">
          {dish.image ? (
            <img 
              src={dish.image} 
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* Dish Info - Simplified */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-base truncate pr-2 leading-tight">
              {dish.name}
              {dish.isFavorite && <span className="ml-1 text-red-500">❤️</span>}
              {dish.isHidden && <span className="ml-1 text-gray-400">👁️‍🗨️</span>}
            </h3>
            <span className="font-bold text-lg text-right flex-shrink-0" style={{ color: 'var(--primary, #1f2937)' }}>
              {currency === "EUR" ? "€" : currency === "USD" ? "$" : currency === "PLN" ? "zł" : currency === "MDL" ? "lei" : ""}
              {dish.price}
            </span>
          </div>

          {dish.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-2 leading-snug">
              {dish.description}
            </p>
          )}

          {/* Compact Tags */}
          {dish.tags && dish.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dish.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterByTag?.(tag);
                  }}
                >
                  {getTagEmoji(tag)} {tag}
                </Badge>
              ))}
              {dish.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{dish.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Admin Actions - Hidden in guest view */}
          {showActions && restaurantId && (
            <div className="mt-2 pt-2 border-t border-gray-100 flex space-x-1">
              <DishActions dish={dish} restaurantId={restaurantId} />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(dish);
                }}
              >
                <Edit size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(dish);
                }}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

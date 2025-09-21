import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Eye } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import type { Dish } from "@shared/schema";

interface DishCardProps {
  dish: Dish;
  currency: string;
  onViewDetails: (dish: Dish) => void;
  isCompact?: boolean;
  onFilterByTag?: (tag: string) => void;
}

// Memoized dish card to prevent unnecessary re-renders
export const MemoDishCard = memo(function DishCard({
  dish,
  currency,
  onViewDetails,
  isCompact = false,
  onFilterByTag,
}: DishCardProps) {
  const { t } = useTranslation();
  console.log('DishCard rendering:', dish.name);
  
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'EUR': '€',
      'USD': '$',
      'PLN': 'zł',
      'MDL': 'L'
    };
    return symbols[currency] || currency;
  };

  const getTagEmoji = (tag: string) => {
    const tagEmojis: Record<string, string> = {
      'vegetarian': '🌱',
      'vegan': '🌿',
      'gluten-free': '🌾',
      'spicy': '🌶️',
      'popular': '⭐',
      'healthy': '💚',
      'kids': '👶',
      'alcohol': '🍷'
    };
    return tagEmojis[tag.toLowerCase()] || '🏷️';
  };

  return (
    <div 
      className={cn(
        "bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-gray-300",
        isCompact ? "p-3" : "p-4"
      )}
      style={{ 
        borderRadius: 'var(--card-radius, 8px)',
        padding: 'var(--card-spacing, 12px)'
      }}
    >
      <div className="flex gap-3">
        {/* Image */}
        {dish.image && (
          <div className={cn(
            "flex-shrink-0 rounded overflow-hidden bg-gray-100",
            isCompact ? "w-16 h-16" : "w-20 h-20"
          )}>
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 
                  className={cn(
                    "font-semibold text-gray-900 truncate",
                    isCompact ? "text-sm" : "text-base"
                  )}
                  style={{ color: 'var(--foreground, #1f2937)' }}
                >
                  {dish.name}
                </h3>
                {dish.isFavorite && (
                  <Heart 
                    className={cn(
                      "text-red-500 fill-current flex-shrink-0",
                      isCompact ? "h-3 w-3" : "h-4 w-4"
                    )} 
                  />
                )}
              </div>
              
              {dish.description && (
                <p 
                  className={cn(
                    "text-gray-600 line-clamp-2 mt-1",
                    isCompact ? "text-xs" : "text-sm"
                  )}
                >
                  {dish.description}
                </p>
              )}

              {/* Tags */}
              {dish.tags && dish.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {dish.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className={cn(
                        "text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700",
                        isCompact && "text-[10px] px-1",
                        onFilterByTag && "cursor-pointer hover:bg-gray-200 transition-colors"
                      )}
                      onClick={onFilterByTag ? () => onFilterByTag(tag) : undefined}
                    >
                      {getTagEmoji(tag)} {tag}
                    </Badge>
                  ))}
                  {dish.tags.length > 3 && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700",
                        isCompact && "text-[10px] px-1"
                      )}
                    >
                      +{dish.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Price and Action */}
            <div className="flex flex-col items-end gap-2">
              <span 
                className={cn(
                  "font-bold text-gray-900",
                  isCompact ? "text-sm" : "text-lg"
                )}
                style={{ color: 'var(--primary, #1f2937)' }}
              >
                {dish.price} {getCurrencySymbol(currency)}
              </span>
              
              <Button
                variant="outline"
                size={isCompact ? "sm" : "default"}
                onClick={() => onViewDetails(dish)}
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isCompact ? "h-6 px-2" : "h-8 px-3"
                )}
              >
                <Eye className={cn(isCompact ? "h-3 w-3" : "h-4 w-4")} />
                {isCompact ? t('info') : t('moreDetails')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance
  return (
    prevProps.dish.id === nextProps.dish.id &&
    prevProps.dish.name === nextProps.dish.name &&
    prevProps.dish.price === nextProps.dish.price &&
    prevProps.dish.isFavorite === nextProps.dish.isFavorite &&
    prevProps.dish.image === nextProps.dish.image &&
    prevProps.currency === nextProps.currency &&
    JSON.stringify(prevProps.dish.tags) === JSON.stringify(nextProps.dish.tags)
  );
});
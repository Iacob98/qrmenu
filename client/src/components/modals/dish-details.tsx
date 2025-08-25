import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Utensils } from "lucide-react";
import { useTranslation } from 'react-i18next';
import type { Dish } from "@shared/schema";

interface DishDetailsModalProps {
  dish: Dish | null;
  currency: string;
  onClose: () => void;
}

export function DishDetailsModal({ dish, currency, onClose }: DishDetailsModalProps) {
  const { t } = useTranslation();
  if (!dish) return null;

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      EUR: "€",
      USD: "$", 
      PLN: "zł",
      MDL: "L",
    };
    return symbols[currency] || currency;
  };

  const getTagEmoji = (tag: string) => {
    const emojis: Record<string, string> = {
      "vegetarian": "🥦",
      "vegan": "🌱", 
      "spicy": "🌶️",
      "gluten-free": "🌾",
      "dairy-free": "🥛",
      "meat": "🥩",
      "healthy": "💚",
      "popular": "⭐",
    };
    return emojis[tag] || "🏷️";
  };

  const tagColors: Record<string, string> = {
    "vegetarian": "bg-green-100 text-green-700",
    "vegan": "bg-green-100 text-green-700",
    "spicy": "bg-red-100 text-red-700",
    "gluten-free": "bg-blue-100 text-blue-700",
    "dairy-free": "bg-purple-100 text-purple-700",
    "meat": "bg-orange-100 text-orange-700",
    "healthy": "bg-emerald-100 text-emerald-700",
    "popular": "bg-yellow-100 text-yellow-700",
  };

  return (
    <Dialog open={!!dish} onOpenChange={onClose}>
      <DialogContent className="max-w-xs sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-left">{dish.name}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('dishDetailsTitle')} {dish.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Dish Image */}
          <div className="w-full h-32 sm:h-48 bg-gray-200 rounded-lg">
            {dish.image ? (
              <img 
                src={dish.image} 
                alt={dish.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <Utensils className="text-primary-500 text-2xl sm:text-4xl" />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-center">
            <span className="text-xl sm:text-2xl font-bold text-primary-600">
              {getCurrencySymbol(currency)}{String(dish.price)}
            </span>
          </div>

          {/* Description */}
          {dish.description && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('description')}</h4>
              <p className="text-gray-600 text-sm sm:text-base">{dish.description}</p>
            </div>
          )}

          {/* Ingredients */}
          {dish.ingredients && dish.ingredients.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('ingredients')}</h4>
              <p className="text-gray-600 text-sm sm:text-base">{dish.ingredients.join(", ")}</p>
            </div>
          )}

          {/* Nutrition Info */}
          {dish.nutrition && typeof dish.nutrition === 'object' && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('nutritionInfo')}</h4>
              <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                {(dish.nutrition as any).calories && (
                  <div className="bg-gray-50 p-1 sm:p-2 rounded">{t('calories')}: {(dish.nutrition as any).calories} {t('kcal')}</div>
                )}
                {(dish.nutrition as any).protein && (
                  <div className="bg-gray-50 p-1 sm:p-2 rounded">{t('protein')}: {(dish.nutrition as any).protein}{t('grams')}</div>
                )}
                {(dish.nutrition as any).carbs && (
                  <div className="bg-gray-50 p-1 sm:p-2 rounded">{t('carbs')}: {(dish.nutrition as any).carbs}{t('grams')}</div>
                )}
                {(dish.nutrition as any).fat && (
                  <div className="bg-gray-50 p-1 sm:p-2 rounded">{t('fat')}: {(dish.nutrition as any).fat}{t('grams')}</div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {dish.tags && dish.tags.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{t('features')}</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {dish.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={`text-xs ${tagColors[tag] || "bg-gray-100 text-gray-700"}`}
                  >
                    {getTagEmoji(tag)} {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="text-center pt-1 sm:pt-2">
            {dish.available === false ? (
              <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                {t('temporarilyUnavailable')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                {t('inStock')}
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
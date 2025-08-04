import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@shared/schema";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

// Memoized component to prevent unnecessary re-renders
export const MemoCategoryTabs = memo(function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  console.log('CategoryTabs rendering with categories:', categories.length);
  
  return (
    <div className="px-3 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <Button
              key={category.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex-shrink-0 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md transform scale-105" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
              )}
            >
              {category.icon && (
                <span className="mr-1.5 text-base">{category.icon}</span>
              )}
              {category.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for performance
  return (
    prevProps.activeCategory === nextProps.activeCategory &&
    prevProps.categories.length === nextProps.categories.length &&
    prevProps.categories.every((cat, index) => 
      cat.id === nextProps.categories[index]?.id &&
      cat.name === nextProps.categories[index]?.name
    )
  );
});
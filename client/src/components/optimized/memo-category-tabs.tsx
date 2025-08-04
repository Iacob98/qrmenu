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
    <div className="px-4 py-4">
      <div className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border",
                isActive 
                  ? "bg-green-500 text-white border-green-500" 
                  : "bg-white text-gray-700 border-gray-300"
              )}
            >
              {category.icon && (
                <span className="mr-1.5">{category.icon}</span>
              )}
              {category.name}
            </button>
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
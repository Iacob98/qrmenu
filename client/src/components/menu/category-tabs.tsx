import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@shared/schema";

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="bg-white border-b">
      <div className="flex overflow-x-auto no-scrollbar px-3 py-2 space-x-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "ghost"}
            size="sm"
            className="flex-shrink-0 whitespace-nowrap text-sm px-3 py-2 h-8"
            onClick={() => onCategoryChange(category.id)}
          >
            {category.icon && <span className="mr-1 text-xs">{category.icon}</span>}
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

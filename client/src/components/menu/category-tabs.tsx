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
    <nav className="bg-white border-b">
      <div className="flex overflow-x-auto scrollbar-hide py-1">
        <Button
          variant="ghost"
          className={cn(
            "px-3 py-2 text-sm whitespace-nowrap rounded-lg mx-1 border-2 transition-all",
            activeCategory === null
              ? "text-primary-600 border-primary-600 bg-primary-50"
              : "text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-100"
          )}
          onClick={() => onCategoryChange(null)}
        >
          Все блюда
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            className={cn(
              "px-3 py-2 text-sm whitespace-nowrap rounded-lg mx-1 border-2 transition-all",
              activeCategory === category.id
                ? "text-primary-600 border-primary-600 bg-primary-50"
                : "text-gray-500 hover:text-gray-700 border-transparent hover:bg-gray-100"
            )}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </div>
    </nav>
  );
}

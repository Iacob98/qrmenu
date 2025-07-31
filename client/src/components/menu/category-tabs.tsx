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
      <div className="flex overflow-x-auto">
        <Button
          variant="ghost"
          className={cn(
            "px-4 py-3 whitespace-nowrap rounded-none border-b-2",
            activeCategory === null
              ? "text-primary-600 border-primary-600"
              : "text-gray-500 hover:text-gray-700 border-transparent"
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
              "px-4 py-3 whitespace-nowrap rounded-none border-b-2",
              activeCategory === category.id
                ? "text-primary-600 border-primary-600"
                : "text-gray-500 hover:text-gray-700 border-transparent"
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

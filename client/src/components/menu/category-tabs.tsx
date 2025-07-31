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
    <nav className="bg-white border-b sticky top-0 z-30 shadow-sm">
      <div className="flex overflow-x-auto scrollbar-hide py-2 px-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            className={cn(
              "px-6 py-4 text-base font-medium whitespace-nowrap rounded-lg mx-1 transition-all duration-200",
              activeCategory === category.id
                ? "text-white bg-primary-600 shadow-md hover:bg-primary-700"
                : "text-gray-600 hover:text-primary-600 hover:bg-primary-50"
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

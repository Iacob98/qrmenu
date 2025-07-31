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
      <div className="flex overflow-x-auto scrollbar-hide py-3 px-2 gap-1">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant="ghost"
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap rounded-lg mx-1 transition-all duration-200 border min-w-fit",
              activeCategory === category.id
                ? "text-white shadow-md border-transparent"
                : "text-gray-800 bg-white border-gray-300 shadow-sm"
            )}
            style={
              activeCategory === category.id
                ? {
                    backgroundColor: 'var(--primary, #22c55e)',
                    borderColor: 'var(--primary, #22c55e)',
                  }
                : {}
            }
            onClick={() => onCategoryChange(category.id)}
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </div>
    </nav>
  );
}

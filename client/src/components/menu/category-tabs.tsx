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
    <div className="bg-white">
      <div className="flex overflow-x-auto no-scrollbar px-3 py-3 space-x-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex-shrink-0 whitespace-nowrap text-sm px-4 py-2 h-9 rounded-full font-medium transition-all",
              activeCategory === category.id 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "hover:bg-gray-100 text-gray-600"
            )}
            onClick={() => onCategoryChange(category.id)}
            style={activeCategory === category.id ? {
              backgroundColor: 'var(--primary, #22c55e)',
              color: 'var(--primary-foreground, white)'
            } : {}}
          >
            {category.icon && <span className="mr-1.5 text-sm">{category.icon}</span>}
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

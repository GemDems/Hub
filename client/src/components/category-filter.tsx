import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  label: string;
  emoji: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mb-16">
      <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            variant={activeCategory === category.id ? "default" : "outline"}
            className={`group px-8 py-4 rounded-2xl font-bold transition-all duration-500 flex items-center space-x-3 transform hover:scale-105 ${
              activeCategory === category.id
                ? "bg-gradient-to-r from-black to-gray-900 text-white shadow-2xl scale-105"
                : "bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-gray-200/50 hover:border-black/20 hover:bg-white hover:shadow-xl"
            }`}
          >
            {category.emoji && (
              <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${
                activeCategory === category.id ? '' : 'group-hover:rotate-12'
              }`}>
                {category.emoji}
              </span>
            )}
            <span className="tracking-wide">{category.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

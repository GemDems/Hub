import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoCarouselProps {
  images: string[];
  title: string;
  className?: string;
}

export default function PhotoCarousel({ images, title, className = "" }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out empty images
  const validImages = images.filter(img => img && img.trim());
  
  if (validImages.length === 0) {
    // Return gradient background when no images
    return (
      <div className={`relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl ${className}`}>
        <div className="text-center px-4">
          <div className="text-2xl mb-2">💎</div>
          <div className="text-sm opacity-90">Premium Deal</div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      {/* Main Image */}
      <img
        src={validImages[currentIndex]}
        alt={`${title} - Image ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-300"
        onError={(e) => {
          // Fallback to gradient if image fails to load
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
      
      {/* Fallback gradient (hidden by default) */}
      <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
        <div className="text-center">
          <div className="text-2xl mb-2">💎</div>
          <div className="text-sm opacity-90">Premium Deal</div>
        </div>
      </div>

      {/* Navigation Arrows - only show if multiple images */}
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Image Indicators */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {validImages.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
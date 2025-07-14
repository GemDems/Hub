import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, ShoppingCart, Users, Star, Clock, Zap, TrendingUp, Award, AlertCircle, Trash2, Eye, EyeOff } from "lucide-react";
import PhotoCarousel from "./photo-carousel";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AffiliateLink } from "@shared/schema";

interface AffiliateCardProps {
  link: AffiliateLink;
}

export default function AffiliateCard({ link }: AffiliateCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const alerts = [
    "🔔 Real-time Stock Drop",
    "📉 Price Dropped Again!",
    "🔥 Locked For You",
    "⚠️ Deal Watchlist Alerts",
    "👥 Others Also Bought"
  ];

  const [currentAlertText, setCurrentAlertText] = useState(alerts[0] || "");

  // Cycle through alerts every 4 seconds for each product
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % alerts.length;
      const nextAlert = alerts[currentIndex];
      if (nextAlert && nextAlert.trim()) {
        setCurrentAlertText(nextAlert);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const trackClickMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/affiliate-links/${link.id}/click`);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Click tracked successfully:', data);
      // Do NOT redirect here - let handleClick control the redirect
    },
    onError: (error) => {
      console.error('Click tracking failed (but continuing with redirect):', error);
      // Do NOT redirect here - let handleClick control the redirect  
    }
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest("DELETE", `/api/affiliate-links/${link.id}`, { password });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      setShowDeleteDialog(false);
      setPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
      setPassword("");
    },
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    deleteLinkMutation.mutate(password);
  };

  const handleClick = () => {
    // Update savings progress
    const priceMatch = price.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch && (window as any).updateSavingsProgress) {
      const amount = parseInt(priceMatch[1].replace(/,/g, ''));
      (window as any).updateSavingsProgress(amount);
    }
    
    // Start tracking in background (but don't wait for it)
    trackClickMutation.mutate();
    
    // IMMEDIATE REDIRECT TO ENTERED URL - PERIOD.
    window.location.href = link.url;
  };

  const getCategoryEmoji = (category: string) => {
    if (!category) return '💎';
    const lowercaseCategory = category.toLowerCase();
    if (lowercaseCategory.includes('hot')) return '🔥';
    if (lowercaseCategory.includes('tech')) return '📱';
    if (lowercaseCategory.includes('fashion')) return '👔';
    if (lowercaseCategory.includes('health')) return '💪';
    if (lowercaseCategory.includes('travel')) return '✈️';
    return '💎';
  };

  const getPrice = () => {
    // Use actual price from database if available, otherwise generate random price
    if (link.price && link.price.trim()) {
      return link.price;
    }
    const prices = ['$49', '$79', '$129', '$199', '$299', '$399'];
    return prices[Math.floor(Math.random() * prices.length)];
  };

  const getRandomDiscount = () => {
    const discounts = ['25%', '40%', '50%', '60%', '70%'];
    return discounts[Math.floor(Math.random() * discounts.length)];
  };

  const getRandomStats = () => {
    const buyers = Math.floor(Math.random() * 1000) + 100;
    const rating = (4.0 + Math.random() * 1).toFixed(1);
    const reviews = Math.floor(Math.random() * 500) + 50;
    const timeLeft = Math.floor(Math.random() * 12) + 1;
    const stockLeft = Math.floor(Math.random() * 15) + 3;
    const savedAmount = Math.floor(Math.random() * 200) + 50;
    return { buyers, rating, reviews, timeLeft, stockLeft, savedAmount };
  };

  const stats = getRandomStats();
  const price = getPrice();
  const discount = getRandomDiscount();
  
  // Stock countdown (simulated for demo)
  const [stock, setStock] = useState(() => {
    const randomStock = Math.floor(Math.random() * 8) + 1;
    return randomStock;
  });
  
  // Elite pick logic (simulated - would be based on database flag)
  const isElitePick = Math.random() < 0.2; // 20% chance for demo

  // Generate clean images array without duplication
  const allImages = link.imageUrls && link.imageUrls.length > 0 ? 
    link.imageUrls.filter(url => url && url.trim()) : 
    (link.imageUrl && link.imageUrl.trim() ? [link.imageUrl] : []);

  const remainingStock = Math.floor(Math.random() * 15) + 3;

  const images = link.imageUrls && link.imageUrls.length > 0 ? 
    link.imageUrls.filter(url => url && url.trim()) : 
    (link.imageUrl && link.imageUrl.trim() ? [link.imageUrl] : []);

  return (
    <Card className="group relative overflow-hidden bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
      {/* Invisible Delete Button - Completely Hidden */}
      <button
        onClick={() => setShowDeleteDialog(true)}
        className="absolute top-2 right-2 z-50 w-6 h-6 bg-transparent hover:bg-transparent border-0 shadow-none opacity-0 transition-opacity duration-300"
        title="Delete Product"
      >
        <Trash2 className="w-3 h-3 opacity-0" />
      </button>

      {/* Alert Badge */}
      <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
        {currentAlertText}
      </div>

      {/* Elite Pick Badge - Only show for Elite picks */}
      {link.isElitePick ? (
        <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Award className="w-3 h-3" />
          Elite Pick
        </div>
      ) : null}

      {/* Verified Badge */}
      {link.isVerified ? (
        <div className="absolute top-12 right-3 z-20 bg-gradient-to-r from-green-500 to-green-700 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Star className="w-3 h-3" />
          Verified
        </div>
      ) : null}

      {/* Photo Carousel */}
      <PhotoCarousel 
        images={images} 
        title={link.title}
        className="h-48 object-cover"
      />

      <CardContent className="p-6 space-y-4">
        {/* Category and Stock Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCategoryEmoji(link.category)}</span>
            <span className="text-sm font-medium text-gray-600 capitalize">
              {link.category}
            </span>
          </div>
          
          {/* Live Stock Counter */}
          <div className="text-right">
            <div className="text-xs text-red-600 font-bold animate-pulse">
              ONLY {remainingStock} LEFT
            </div>
            <div className="text-xs text-gray-500">
              {Math.floor(Math.random() * 50) + 10} watching
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {link.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2">
          {link.description}
        </p>

        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">{price}</span>
            <span className="text-lg text-gray-400 line-through">
              {(() => {
                const priceMatch = price.match(/[\d.]+/);
                if (priceMatch) {
                  const numericPrice = parseFloat(priceMatch[0]);
                  const originalPrice = Math.round(numericPrice * 2.2);
                  return price.replace(/[\d.]+/, originalPrice.toString());
                }
                return '$99';
              })()}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-red-600 font-bold">Save {discount}</div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="font-semibold">{stats.rating}</span>
            </div>
            <div className="text-gray-500">{stats.reviews} reviews</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-3 h-3 text-blue-500" />
              <span className="font-semibold">{stats.buyers}</span>
            </div>
            <div className="text-gray-500">bought this week</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="font-semibold">Trending</span>
            </div>
            <div className="text-gray-500">popular choice</div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleClick}
          disabled={trackClickMutation.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <span className="flex items-center justify-center">
            {trackClickMutation.isPending ? (
              <>Processing...</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Get Deal Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </span>
        </Button>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Encrypted</span>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" aria-describedby="delete-description">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Product</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleDelete} className="space-y-4">
            <p id="delete-description" className="text-sm text-gray-600">
              Are you sure you want to permanently delete "{link.title}"? This action cannot be undone.
            </p>
            
            <div className="relative">
              <Label htmlFor="deletePassword">Enter Creator Password</Label>
              <div className="relative mt-1">
                <Input
                  id="deletePassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to confirm deletion"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleteLinkMutation.isPending || !password.trim()}
                className="flex-1"
              >
                {deleteLinkMutation.isPending ? "Deleting..." : "Delete Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
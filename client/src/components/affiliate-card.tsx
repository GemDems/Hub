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

  return (
    <>
      <div className="group relative h-80 w-full">
        {/* Glassmorphic Card Base */}
        <Card className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Background Blur Layer with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30"></div>

          
          {/* Floating Product Image - Upper Half */}
          <div className="absolute top-4 left-4 right-4 h-40 z-20">
            <div className="relative h-full rounded-xl overflow-hidden">
              <PhotoCarousel 
                images={allImages}
                title={link.title}
                className="h-full object-cover"
              />
              {/* Image fade-out blur at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/60 to-transparent backdrop-blur-sm"></div>
            </div>
          </div>

          {/* Invisible Delete Button */}
          <div className="absolute top-2 right-2 z-50" style={{ opacity: 0, visibility: 'hidden' }}>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              className="w-8 h-8 p-0 bg-transparent hover:bg-transparent border-0 shadow-none"
              title="Delete Product"
              style={{ opacity: 0, visibility: 'hidden' }}
            >
              <Trash2 className="w-4 h-4" style={{ opacity: 0, visibility: 'hidden' }} />
            </Button>
          </div>
        
          {/* Cycling Alert Badge */}
          {isElitePick && currentAlertText ? (
            <div className="absolute top-3 left-3 z-40 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
              <Users className="w-3 h-3 inline mr-1" />
              {currentAlertText}
            </div>
          ) : null}
          
          {/* Verified Source Badge */}
          {link.isVerified ? (
            <div className="absolute top-3 right-3 z-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <div className="w-3 h-3 bg-white rounded-full mr-1 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              Verified
            </div>
          ) : null}
          
          {/* Card Content - Bottom Half */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-white/70 backdrop-blur-sm border-t border-white/30 rounded-b-2xl p-4">
            {/* Stock Alert */}
            {stock > 0 ? (
              <div className="absolute top-2 right-2 bg-gradient-to-r from-urgency-red to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                ONLY {stock} LEFT
              </div>
            ) : null}
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
              {link.title}
            </h3>
            
            <p className="text-gray-700 text-sm line-clamp-2 mb-3">
              {link.description}
            </p>
            
            {/* Pricing and CTA */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-bold text-green-600">{price}</span>
                <span className="text-sm text-gray-400 line-through ml-2">
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
              <div className="text-xs text-red-600 font-bold">
                Save {discount}
              </div>
            </div>
            
            <Button
              onClick={handleClick}
              disabled={trackClickMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-300"
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
          </div>
        </Card>
      </div>


    {/* Delete Confirmation Dialog */}
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="max-w-md" aria-describedby="delete-description">
        <DialogHeader>
          <DialogTitle className="text-urgency-red">Delete Product</DialogTitle>
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
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-urgency-red hover:bg-red-700"
              disabled={deleteLinkMutation.isPending}
            >
              {deleteLinkMutation.isPending ? "Deleting..." : "Delete Product"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setPassword("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

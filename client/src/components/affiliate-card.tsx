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
      console.log('Redirect data:', data); // Debug log
      // Immediately redirect to affiliate link
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No URL received from API');
      }
    },
    onError: (error) => {
      console.error('Click tracking failed:', error);
      // Fallback: redirect to the original link URL
      window.location.href = link.url;
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
    // Extract price and update savings progress
    const priceMatch = price.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatch) {
      const amount = parseInt(priceMatch[1].replace(/,/g, ''));
      // Update savings progress globally
      if ((window as any).updateSavingsProgress) {
        (window as any).updateSavingsProgress(amount);
      }
    }
    
    // Track the click (but don't wait for response)
    trackClickMutation.mutate();
    
    // Small delay to allow tracking, then redirect
    setTimeout(() => {
      window.location.href = link.url;
    }, 100);
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
      <Card className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border-2 border-gray-100 hover:border-conversion-blue/30 overflow-hidden group relative backdrop-blur-sm">

        
        {/* Invisible Delete Button */}
        <div className="absolute top-2 right-2 z-30" style={{ opacity: 0, visibility: 'hidden' }}>
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
          <div className="absolute top-[0px] left-[0px] right-[0px] z-30">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs font-bold text-center py-1">
              <Users className="w-3 h-3 inline mr-1" />
              {currentAlertText}
            </div>
          </div>
        ) : null}
        
        {/* Verified Source Badge */}
        {link.isVerified && (
          <div className={`absolute ${isElitePick ? 'top-6' : 'top-[0px]'} left-[0px] right-[0px] z-20`}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold text-center py-1 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full mr-1 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
              🔒 Verified Source Badge (Amazon/Walmart/etc)
            </div>
          </div>
        )}
        
        {/* Stock Countdown Alert */}
        {stock > 0 ? (
          <div className={`absolute ${isElitePick && link.isVerified ? 'top-12' : isElitePick || link.isVerified ? 'top-6' : 'top-[0px]'} left-[0px] right-[0px] z-10`}>
            <div className="bg-gradient-to-r from-urgency-red to-red-600 text-white text-xs font-bold text-center py-1">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              ONLY {stock} LEFT IN STOCK
            </div>
          </div>
        ) : null}
      
      <div className={`relative ${isElitePick && link.isVerified ? 'mt-12' : isElitePick || link.isVerified ? 'mt-8' : 'mt-6'}`}>
        {/* Clean Badges */}
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-urgency-red to-red-600 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {getCategoryEmoji(link.category)} BESTSELLER
          </div>
        </div>
        
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-gradient-to-r from-action-orange to-orange-600 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <Clock className="w-3 h-3 mr-1 inline" />
            {stats.timeLeft}H LEFT
          </div>
        </div>
        
        {/* Photo Carousel */}
        <PhotoCarousel 
          images={allImages}
          title={link.title}
          className="w-full h-48"
        />
      </div>
      
      <CardContent className="p-6 space-y-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3 group-hover:from-conversion-blue group-hover:to-blue-700 transition-all duration-300">
          {link.title}
        </h3>
        
        <p className="text-gray-700 mb-4 text-sm line-clamp-3 leading-relaxed">
          {link.description}
        </p>
        
        {/* Ultra Social Proof Matrix */}
        <div className="bg-gradient-to-br from-trust-green/5 via-blue-50 to-purple-50 p-4 rounded-xl border-2 border-trust-green/20 shadow-inner mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-green-700 mr-1" />
                <span className="text-xs font-bold text-green-800">{stats.buyers} bought</span>
              </div>
              <div className="text-xs text-gray-700">this week</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-700 mr-1" />
                <span className="text-xs font-bold text-blue-800">+{Math.floor(Math.random() * 50) + 30}%</span>
              </div>
              <div className="text-xs text-gray-700">demand ↗</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-600 mr-1" />
                <span className="text-xs font-bold text-yellow-800">{stats.rating}/5</span>
              </div>
              <div className="text-xs text-gray-700">{stats.reviews} reviews</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
              <div className="flex items-center">
                <Award className="w-4 h-4 text-purple-700 mr-1" />
                <span className="text-xs font-bold text-purple-800">#1 Choice</span>
              </div>
              <div className="text-xs text-gray-700">bestseller</div>
            </div>
          </div>
        </div>
        
        {/* Clean Psychological Triggers */}
        <div className="space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-semibold text-red-700">
                Limited time: Save ${stats.savedAmount} today
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="text-center text-sm font-medium text-blue-700">
              {Math.floor(Math.random() * 15) + 5} people viewing this deal
            </div>
          </div>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-trust-green">{price}</span>
            <span className="text-lg text-gray-400 line-through ml-2">
              {(() => {
                // Extract number from price for calculation
                const priceMatch = price.match(/[\d.]+/);
                if (priceMatch) {
                  const numericPrice = parseFloat(priceMatch[0]);
                  const originalPrice = Math.round(numericPrice * 2.2); // 2.2x for better savings perception
                  // Keep the same currency symbol/format as the actual price
                  return price.replace(/[\d.]+/, originalPrice.toString());
                }
                // Fallback for non-standard price formats
                return price.startsWith('$') ? `$${parseInt(price.slice(1) || '50') * 2}` : '$99';
              })()}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-urgency-red font-semibold">Save {discount}</div>
            <div className="text-xs text-gray-500">{discount} OFF</div>
          </div>
        </div>
        
        {/* Ultimate CTA Experience */}
        <div className="space-y-3">
          <Button
            onClick={handleClick}
            disabled={trackClickMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center text-lg">
              {trackClickMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Get Deal Now
                  <ExternalLink className="w-5 h-5 ml-2" />
                </>
              )}
            </span>
          </Button>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
              <div className="text-xs font-medium text-green-700">SSL Secured</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
              <div className="text-xs font-medium text-blue-700">Encrypted</div>
            </div>
          </div>
          

        </div>
        
        {/* Social Proof */}
        <div className="mt-4 space-y-2">
          {link.clicks > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
              <div className="text-sm font-medium text-blue-700">
                {link.clicks} people claimed this deal
              </div>
            </div>
          ) : null}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">
                {Math.floor(Math.random() * 20) + 15} people viewing
              </div>
              <div className="text-xs text-gray-500">
                Updated {Math.floor(Math.random() * 5) + 1} minutes ago
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

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

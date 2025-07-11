import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ShoppingCart, Users, Star, Clock, Zap, TrendingUp, Award, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { AffiliateLink } from "@shared/schema";

interface AffiliateCardProps {
  link: AffiliateLink;
}

export default function AffiliateCard({ link }: AffiliateCardProps) {
  const trackClickMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/affiliate-links/${link.id}/click`);
      return response.json();
    },
    onSuccess: (data) => {
      // Open affiliate link in new tab
      window.open(data.url, '_blank', 'noopener,noreferrer');
    },
  });

  const handleClick = () => {
    trackClickMutation.mutate();
  };

  const getCategoryEmoji = (category: string) => {
    const lowercaseCategory = category.toLowerCase();
    if (lowercaseCategory.includes('hot')) return '🔥';
    if (lowercaseCategory.includes('tech')) return '📱';
    if (lowercaseCategory.includes('fashion')) return '👔';
    if (lowercaseCategory.includes('health')) return '💪';
    if (lowercaseCategory.includes('travel')) return '✈️';
    return '💎';
  };

  const getRandomPrice = () => {
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
  const price = getRandomPrice();
  const discount = getRandomDiscount();

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group relative">
      {/* Urgent Stock Alert */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-urgency-red to-red-600 text-white text-xs font-bold text-center py-1 z-20 animate-pulse">
        <AlertCircle className="w-3 h-3 inline mr-1" />
        ONLY {stats.stockLeft} LEFT IN STOCK - HURRY!
      </div>
      
      <div className="relative mt-6">
        {/* Trending badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-urgency-red text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg">
            {getCategoryEmoji(link.category)} #1 TRENDING
          </span>
        </div>
        
        {/* Limited time badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-action-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            <Clock className="w-3 h-3 mr-1 inline" />
            {stats.timeLeft}H LEFT
          </span>
        </div>
        
        {/* Flash Sale Badge */}
        <div className="absolute top-12 left-3 z-10">
          <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-bounce">
            <Zap className="w-3 h-3 inline mr-1" />
            FLASH SALE
          </span>
        </div>
        
        {/* Product Image or Gradient overlay */}
        {link.imageUrl ? (
          <div className="w-full h-48 relative overflow-hidden">
            <img 
              src={link.imageUrl} 
              alt={link.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to gradient if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-conversion-blue to-purple-600 flex items-center justify-center">
                      <div class="text-white text-6xl opacity-80">
                        ${getCategoryEmoji(link.category)}
                      </div>
                    </div>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-conversion-blue to-purple-600 flex items-center justify-center">
            <div className="text-white text-6xl opacity-80">
              {getCategoryEmoji(link.category)}
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-conversion-blue transition-colors">
          {link.title}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {link.description}
        </p>
        
        {/* Enhanced Social Proof */}
        <div className="bg-gradient-to-r from-trust-green/10 to-blue-50 p-3 rounded-lg mb-4 border border-trust-green/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Users className="w-4 h-4 text-trust-green mr-1" />
              <span className="text-sm font-medium text-trust-green">{stats.buyers} bought this week</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium text-blue-500">+{Math.floor(Math.random() * 50) + 10}% demand</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{stats.rating} ({stats.reviews} reviews)</span>
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-sm font-medium text-purple-500">Best Seller</span>
            </div>
          </div>
        </div>
        
        {/* Urgency Timer */}
        <div className="bg-urgency-red/10 border border-urgency-red/30 rounded-lg p-2 mb-4">
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 text-urgency-red mr-2" />
            <span className="text-sm font-bold text-urgency-red">
              Sale ends in {stats.timeLeft} hours! Don't miss out!
            </span>
          </div>
        </div>
        
        {/* Savings Highlight */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mb-4">
          <div className="text-center">
            <span className="text-lg font-bold text-yellow-700">
              💰 You Save ${stats.savedAmount} Today!
            </span>
          </div>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-trust-green">{price}</span>
            <span className="text-lg text-gray-400 line-through ml-2">
              ${parseInt(price.slice(1)) * 2}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-urgency-red font-semibold">Save {discount}</div>
            <div className="text-xs text-gray-500">{discount} OFF</div>
          </div>
        </div>
        
        {/* Enhanced CTA Button */}
        <Button
          onClick={handleClick}
          disabled={trackClickMutation.isPending}
          className="w-full bg-gradient-to-r from-action-orange to-urgency-red hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden animate-pulse-glow"
        >
          <div className="shimmer-effect absolute inset-0"></div>
          <span className="relative z-10 flex items-center justify-center">
            {trackClickMutation.isPending ? (
              <>Loading...</>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                🚀 CLAIM YOUR DEAL NOW!
                <ExternalLink className="w-5 h-5 ml-2" />
              </>
            )}
          </span>
        </Button>
        
        {/* Guarantee Badge */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center bg-trust-green/10 text-trust-green border border-trust-green/30 rounded-full px-3 py-1 text-xs font-medium">
            <Award className="w-3 h-3 mr-1" />
            30-Day Money Back Guarantee
          </div>
        </div>
        
        {/* Enhanced Click counter with social proof */}
        <div className="mt-3 text-center">
          {link.clicks > 0 && (
            <div className="text-xs text-gray-500 mb-1">
              🔥 {link.clicks} people grabbed this deal
            </div>
          )}
          <div className="text-xs text-urgency-red font-medium animate-pulse">
            ⚡ {Math.floor(Math.random() * 20) + 5} people viewing this right now
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

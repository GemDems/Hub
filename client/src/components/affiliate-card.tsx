import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, ShoppingCart, Users, Star, Clock } from "lucide-react";
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
    return { buyers, rating, reviews };
  };

  const stats = getRandomStats();
  const price = getRandomPrice();
  const discount = getRandomDiscount();

  return (
    <Card className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden group">
      <div className="relative">
        {/* Trending badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-urgency-red text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            {getCategoryEmoji(link.category)} TRENDING
          </span>
        </div>
        
        {/* Limited time badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-action-orange text-white text-xs font-bold px-3 py-1 rounded-full">
            <Clock className="w-3 h-3 mr-1 inline" />
            LIMITED
          </span>
        </div>
        
        {/* Gradient overlay for visual appeal */}
        <div className="w-full h-48 bg-gradient-to-br from-conversion-blue to-purple-600 flex items-center justify-center">
          <div className="text-white text-6xl opacity-80">
            {getCategoryEmoji(link.category)}
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-conversion-blue transition-colors">
          {link.title}
        </h3>
        
        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
          {link.description}
        </p>
        
        {/* Social Proof */}
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <div className="flex items-center mr-4">
            <Users className="w-4 h-4 text-trust-green mr-1" />
            <span>{stats.buyers} bought this week</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span>{stats.rating} ({stats.reviews} reviews)</span>
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
        
        {/* CTA Button */}
        <Button
          onClick={handleClick}
          disabled={trackClickMutation.isPending}
          className="w-full bg-gradient-to-r from-action-orange to-urgency-red hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden"
        >
          <div className="shimmer-effect absolute inset-0"></div>
          <span className="relative z-10 flex items-center justify-center">
            {trackClickMutation.isPending ? (
              <>Loading...</>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                GET DEAL NOW
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </span>
        </Button>
        
        {/* Click counter */}
        <div className="mt-3 text-center text-xs text-gray-500">
          {link.clicks > 0 && `${link.clicks} people clicked this deal`}
        </div>
      </CardContent>
    </Card>
  );
}

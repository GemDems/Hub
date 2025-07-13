import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, TrendingUp, Zap, Clock } from "lucide-react";
import type { AffiliateLink } from "@shared/schema";

interface SearchBarProps {
  onSearch: (query: string) => void;
  links: AffiliateLink[];
}

export default function SearchBar({ onSearch, links }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingSearches] = useState([
    "🔥 Smart watches",
    "💎 Premium headphones", 
    "⚡ Gaming laptops",
    "🏆 Fitness trackers",
    "🎯 Kitchen gadgets"
  ]);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = links
        .filter(link => 
          link.title.toLowerCase().includes(query.toLowerCase()) ||
          link.description.toLowerCase().includes(query.toLowerCase()) ||
          link.category.toLowerCase().includes(query.toLowerCase())
        )
        .map(link => link.title)
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query, links]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch(searchQuery);
    setShowSuggestions(false);
  };

  return (
    <div className="relative max-w-4xl mx-auto mb-8">
      {/* Psychological Pre-Search Triggers */}
      <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-2 border-yellow-300 rounded-xl p-3 mb-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center text-urgency-red font-bold">
            <Clock className="w-4 h-4 mr-1 animate-pulse" />
            ⏰ Flash deals expire in 2 hours
          </div>
          <div className="flex items-center text-trust-green font-bold">
            <TrendingUp className="w-4 h-4 mr-1" />
            📈 {Math.floor(Math.random() * 50) + 30} deals trending
          </div>
          <div className="flex items-center text-purple-700 font-bold">
            <Zap className="w-4 h-4 mr-1" />
            ⚡ VIP members save 40% more
          </div>
        </div>
      </div>

      {/* Premium Search Interface */}
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 p-6 backdrop-blur-sm">
        <div className="relative">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="🔍 Search exclusive deals... (Try: 'premium', 'gaming', 'fitness')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                className="pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-conversion-blue focus:ring-2 focus:ring-conversion-blue/20 transition-all duration-300"
              />
            </div>
            
            <Button
              onClick={() => handleSearch(query)}
              className="bg-gradient-to-r from-conversion-blue to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Search Deals
            </Button>
          </div>

          {/* Smart Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-30 overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <Search className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">{suggestion}</span>
                    <span className="ml-auto text-xs text-trust-green font-bold">
                      💎 PREMIUM
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Trending Searches with Psychological Triggers */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">🔥 Trending VIP Searches:</span>
            <span className="text-xs text-urgency-red font-bold animate-pulse">
              ⚡ {Math.floor(Math.random() * 100) + 200} searches in last hour
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((trend, index) => (
              <button
                key={index}
                onClick={() => handleSearch(trend.replace(/[🔥💎⚡🏆🎯]\s/, ''))}
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-conversion-blue hover:to-blue-600 hover:text-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-sm"
              >
                {trend}
              </button>
            ))}
          </div>
        </div>

        {/* Trust & Urgency Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-br from-trust-green/10 to-green-50 rounded-lg p-2">
              <div className="text-trust-green font-bold text-xs">✅ All Verified</div>
              <div className="text-xs text-gray-600">Real deals only</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-2">
              <div className="text-yellow-700 font-bold text-xs">⚡ Live Updates</div>
              <div className="text-xs text-gray-600">Fresh every minute</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-2">
              <div className="text-purple-700 font-bold text-xs">🏆 Best Prices</div>
              <div className="text-xs text-gray-600">Guaranteed lowest</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
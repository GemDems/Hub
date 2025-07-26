import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Zap, Clock } from "lucide-react";
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
    "Smart watches",
    "Premium headphones", 
    "Gaming laptops",
    "Fitness trackers",
    "Kitchen gadgets"
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
    <div className="relative max-w-5xl mx-auto mb-12">
      {/* Premium Search Interface */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 blur-lg group-hover:opacity-30 transition-all duration-500"></div>
        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                <Search className="w-6 h-6" />
              </div>
              <Input
                type="text"
                placeholder="Find your next premium purchase..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
                className="pl-16 pr-6 py-6 text-xl rounded-2xl border-0 bg-gray-50/70 focus:bg-white focus:ring-0 focus:outline-none transition-all duration-300 font-medium placeholder-gray-500"
              />
            </div>
            
            <Button
              onClick={() => handleSearch(query)}
              className="bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white px-8 py-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 tracking-wide"
            >
              DISCOVER →
            </Button>
          </div>

          {/* Smart Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-8 right-8 mt-4 bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-2xl z-30 overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 font-medium"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trending Searches */}
      <div className="mt-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-bold text-gray-700 tracking-wide uppercase">Trending Now</span>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {trendingSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => handleSearch(search)}
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-black hover:to-gray-900 text-gray-700 hover:text-white rounded-full text-sm font-medium transition-all duration-300 border border-gray-300 hover:border-black transform hover:scale-105"
            >
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{search}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Activity */}
      <div className="max-w-xl mx-auto mt-6">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl px-6 py-3">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">Live Activity</span>
            </div>
            <div className="text-gray-600">
              <Clock className="w-3 h-3 inline mr-1" />
              <span className="font-bold">847</span> people shopping now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
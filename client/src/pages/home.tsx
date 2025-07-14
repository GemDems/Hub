import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AffiliateLink } from "@shared/schema";
import Header from "@/components/header";
import StatsBar from "@/components/stats-bar";
import SearchBar from "@/components/search-bar";
import CategoryFilter from "@/components/category-filter";
import AffiliateCard from "@/components/affiliate-card";
import AdminPanel from "@/components/admin-panel";
import TrustIndicators from "@/components/trust-indicators";
import { ChevronDown, Dice6 } from "lucide-react";

import Leaderboard from "@/components/leaderboard";
import ReferralSystem from "@/components/referral-system";
import LiveFeed from "@/components/live-feed";
import SavingsProgress from "@/components/savings-progress";
import IdeaSubmission from "@/components/idea-submission";


import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByClicks, setSortByClicks] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [timerCount, setTimerCount] = useState(5);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);




  const { data: affiliateLinks = [], isLoading, refetch } = useQuery<AffiliateLink[]>({
    queryKey: ["/api/affiliate-links"],
  });

  const filteredAndSortedLinks = affiliateLinks
    .filter(link => {
      const matchesCategory = activeCategory === "all" || link.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchesSearch = !searchQuery || 
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortByClicks) {
        return (b.clicks || 0) - (a.clicks || 0); // Most clicked first
      }
      return 0; // Keep original order when not sorting by clicks
    });

  const categories = [
    { id: "all", label: "All Deals", emoji: "" },
    { id: "hot", label: "Hot Deals", emoji: "🔥" },
    { id: "tech", label: "Tech & Gadgets", emoji: "📱" },
    { id: "fashion", label: "Fashion", emoji: "👔" },
    { id: "health", label: "Health & Fitness", emoji: "💪" },
    { id: "travel", label: "Travel", emoji: "✈️" },
  ];

  const handleNewDropsClick = () => {
    setSortByClicks(true);
    setActiveCategory("all");
    setSearchQuery("");
    // Scroll to top of products
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeaderboardClick = () => {
    const leaderboardSection = document.querySelector('[data-section="leaderboard"]');
    leaderboardSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMyDealsClick = () => {
    const savingsSection = document.querySelector('[data-section="savings-progress"]');
    savingsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRandomLink = () => {
    if (affiliateLinks.length === 0) return;
    
    // Get click counts for weighting
    const linksWithClicks = affiliateLinks.map(link => ({
      ...link,
      clicks: link.clicks || 0
    }));
    
    // Sort by clicks (most clicked first)
    const sortedLinks = linksWithClicks.sort((a, b) => b.clicks - a.clicks);
    
    // Create weighted selection with 60% probability for most clicked products
    const totalWeight = sortedLinks.reduce((sum, link, index) => {
      // Higher weight for more clicked products (decreasing weight)
      const weight = index < Math.ceil(sortedLinks.length * 0.6) ? 0.6 : 0.4;
      return sum + weight;
    }, 0);
    
    let random = Math.random() * totalWeight;
    let selectedLink = sortedLinks[0]; // fallback
    
    for (let i = 0; i < sortedLinks.length; i++) {
      const weight = i < Math.ceil(sortedLinks.length * 0.6) ? 0.6 : 0.4;
      if (random <= weight) {
        selectedLink = sortedLinks[i];
        break;
      }
      random -= weight;
    }
    
    // Open in new tab
    window.open(selectedLink.url, '_blank');
  };

  const handleDropdownCategorySelect = (category: string) => {
    setActiveCategory(category);
    setShowDropdown(false);
  };

  // Handle scroll visibility for dropdown button
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 2000; // Show after scrolling down 2000px (about 10 scrolls)
      
      // If button should show and wasn't showing before, and hasn't expired, start timer
      if (shouldShow && !showScrollButton && !hasExpired) {
        setShowScrollButton(true);
        setIsTimerActive(true);
        setTimerCount(5);
      }
      
      // If scrolling back to top, reset everything
      if (scrollY < 100) { // Reset when scrolled near top
        setShowScrollButton(false);
        setIsTimerActive(false);
        setTimerCount(5);
        setHasExpired(false);
        setShowDropdown(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollButton, hasExpired]);

  // Timer countdown effect
  useEffect(() => {
    if (isTimerActive && timerCount > 0) {
      const timer = setTimeout(() => {
        setTimerCount(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isTimerActive && timerCount === 0) {
      // Timer finished, hide button permanently until user scrolls to top
      setShowScrollButton(false);
      setIsTimerActive(false);
      setShowDropdown(false);
      setHasExpired(true);
    }
  }, [isTimerActive, timerCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Dropdown Menu - Top Left (Only shows on scroll) */}
      <div className={`fixed top-4 left-4 z-50 transition-all duration-1000 ${showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="relative dropdown-container">
          {/* Timer indicator */}
          {isTimerActive && (
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
              {timerCount}
            </div>
          )}
          
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-white/30"
            title="Categories"
          >
            <ChevronDown className="w-4 h-4 text-black" />
          </button>
          
          {showDropdown && (
            <div className="absolute top-10 left-0 bg-white/10 backdrop-blur-lg rounded-lg shadow-xl border border-white/20 py-2 min-w-48 z-50">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleDropdownCategorySelect(category.id)}
                  className="w-full px-4 py-2 text-left hover:bg-white/20 flex items-center space-x-2 transition-all duration-200"
                >
                  {category.emoji && <span>{category.emoji}</span>}
                  <span className="text-sm font-medium text-gray-900">{category.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invisible Admin Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowAdmin(true)}
          className="w-16 h-16 bg-transparent hover:bg-transparent border-0 shadow-none opacity-0"
          title="Creator Mode"
        >
          <Settings className="w-4 h-4 opacity-0" />
        </Button>
      </div>

      <Header />
      <StatsBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar 
          onSearch={setSearchQuery}
          links={affiliateLinks}
        />
        
        <CategoryFilter 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        


        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedLinks.length === 0 ? (
          <div className="text-center py-16">
            {searchQuery ? (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No deals found for "{searchQuery}"
                </h3>
                <p className="text-gray-600 mb-8">
                  Try a different search term or browse our categories below
                </p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="bg-conversion-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No deals available yet
                </h3>
                <p className="text-gray-600 mb-8">
                  Use Creator Mode to add your first affiliate link!
                </p>
                <Button 
                  onClick={() => setShowAdmin(true)}
                  className="bg-conversion-blue hover:bg-blue-700"
                >
                  Add Your First Deal
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLinks.map((link) => (
              <AffiliateCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </main>



      <TrustIndicators />
      
      {/* Leaderboard Section - At bottom */}
      <div className="bg-white py-16" data-section="leaderboard">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Elite Leaderboard - <span className="text-blue-600">This Month</span>
          </h2>
          <p className="text-gray-600">Top 10 Savers This Month</p>
        </div>
        <Leaderboard />
      </div>
      
      {/* Hidden Referral System - Bottom section, hard to find */}
      <div className="bg-gray-100 py-8 border-t" data-section="savings-progress">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-gray-500 text-xs mb-4 uppercase tracking-wider">
            Elite Access
          </h2>
          <ReferralSystem />
        </div>
      </div>
      
      {/* Live Feed - At very bottom, requires scroll */}
      <div className="bg-gray-900 py-16">
        <LiveFeed />
      </div>
      
      {/* Mini Navigation - Simple thin links */}
      <div className="bg-gray-900 py-4">
        <div className="text-center">
          <button
            onClick={handleNewDropsClick}
            className="text-white text-sm mx-4 hover:text-blue-300 transition-colors underline"
          >
            🔥 New Drops
          </button>
          <span className="text-gray-500">|</span>
          <button
            onClick={handleLeaderboardClick}
            className="text-white text-sm mx-4 hover:text-blue-300 transition-colors underline"
          >
            🎁 View Leaderboard
          </button>
          <span className="text-gray-500">|</span>
          <button
            onClick={handleMyDealsClick}
            className="text-white text-sm mx-4 hover:text-blue-300 transition-colors underline"
          >
            🛍️ My Deals
          </button>
        </div>
      </div>
      
      {/* Random Deal Dice Button - Above Ideas Box */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-8">
        <div className="text-center">
          <button
            onClick={handleRandomLink}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 mx-auto mb-4"
            title="Random Deal"
          >
            <Dice6 className="w-8 h-8 text-white" />
          </button>
          <p className="text-white text-sm">Click for a random deal!</p>
        </div>
      </div>
      
      {/* User Idea Submission - After Dice Button */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-12">
        <div className="max-w-md mx-auto px-4">
          <IdeaSubmission />
        </div>
      </div>

      <AdminPanel 
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        onSuccess={() => {
          refetch();
          setShowAdmin(false);
        }}
      />
    </div>
  );
}

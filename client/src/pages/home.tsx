import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AffiliateLink } from "@shared/schema";
import Header from "@/components/header";
import StatsBar from "@/components/stats-bar";

import AffiliateCard from "@/components/affiliate-card";
import AdminPanel from "@/components/admin-panel";
import TrustIndicators from "@/components/trust-indicators";
import { ChevronDown, Dice6 } from "lucide-react";

import Leaderboard from "@/components/leaderboard";
import ReferralSystem from "@/components/referral-system";
import LiveFeed from "@/components/live-feed";
import SavingsProgress from "@/components/savings-progress";
import IdeaSubmission from "@/components/idea-submission";
import AIChatbot from "@/components/ai-chatbot";


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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        


        {isLoading ? (
          <div className="space-y-8">
            {/* Featured Loading */}
            <section>
              <div className="h-8 bg-gray-200 rounded mb-6 w-64 mx-auto animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* All Products Loading */}
            <section>
              <div className="h-6 bg-gray-200 rounded mb-4 w-48 mx-auto animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
                    <div className="h-40 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : filteredAndSortedLinks.length === 0 ? (
          <div className="text-center py-16">
            {searchQuery ? (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  No deals found for "{searchQuery}"
                </h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Let our AI assistant help you!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <button 
                    onClick={() => {
                      // Open AI chat with the search query
                      const chatButton = document.querySelector('[data-chat-button]') as HTMLButtonElement;
                      if (chatButton) {
                        chatButton.click();
                        // Pre-fill the chat with user's search query
                        setTimeout(() => {
                          const chatInput = document.querySelector('[data-chat-input]') as HTMLInputElement;
                          if (chatInput) {
                            chatInput.value = `I'm looking for "${searchQuery}"`;
                            chatInput.focus();
                          }
                        }, 500);
                      }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center gap-3"
                  >
                    🤖 Ask AI Assistant
                  </button>
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="bg-conversion-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Clear Search
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Or try a different search term or browse our categories
                </p>
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
          <div className="space-y-12 animate-fade-in">
            {/* Featured Hero Section */}
            {filteredAndSortedLinks.length > 0 && (
              <section className="relative">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight animate-slide-up">
                    Today's Featured Deals
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto animate-slide-up animation-delay-200">
                    Handpicked premium products with exclusive savings
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {filteredAndSortedLinks.slice(0, 3).map((link, index) => (
                    <div 
                      key={link.id} 
                      className="animate-slide-up transform hover:scale-105 transition-all duration-500 ease-out"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <AffiliateCard link={link} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* All Products Grid - More Organized */}
            {filteredAndSortedLinks.length > 3 && (
              <section className="relative">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-slide-up">
                    Complete Collection
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full animate-scale-in"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedLinks.slice(3).map((link, index) => (
                    <div 
                      key={link.id} 
                      className="animate-fade-in-up transform hover:scale-102 transition-all duration-300 ease-out"
                      style={{ animationDelay: `${(index + 3) * 100}ms` }}
                    >
                      <AffiliateCard link={link} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Simplified Single Grid for Fewer Items */}
            {filteredAndSortedLinks.length <= 3 && filteredAndSortedLinks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredAndSortedLinks.map((link, index) => (
                  <div 
                    key={link.id} 
                    className="animate-slide-up transform hover:scale-105 transition-all duration-500 ease-out"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <AffiliateCard link={link} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <TrustIndicators />
      
      {/* Leaderboard Section - Connected without gap */}
      <div className="bg-white pt-0 pb-10" data-section="leaderboard">
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
      
      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

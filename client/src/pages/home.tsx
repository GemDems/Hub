import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AffiliateLink } from "@shared/schema";
import Header from "@/components/header";
import StatsBar from "@/components/stats-bar";
import SearchBar from "@/components/search-bar";
import CategoryFilter from "@/components/category-filter";
import AffiliateCard from "@/components/affiliate-card";
import AdminPanel from "@/components/admin-panel";
import TrustIndicators from "@/components/trust-indicators";

import Leaderboard from "@/components/leaderboard";
import ReferralSystem from "@/components/referral-system";
import LiveFeed from "@/components/live-feed";

import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function Home() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");


  const { data: affiliateLinks = [], isLoading, refetch } = useQuery<AffiliateLink[]>({
    queryKey: ["/api/affiliate-links"],
  });

  const filteredAndSortedLinks = affiliateLinks.filter(link => {
    const matchesCategory = activeCategory === "all" || link.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "all", label: "All Deals", emoji: "" },
    { id: "hot", label: "Hot Deals", emoji: "🔥" },
    { id: "tech", label: "Tech & Gadgets", emoji: "📱" },
    { id: "fashion", label: "Fashion", emoji: "👔" },
    { id: "health", label: "Health & Fitness", emoji: "💪" },
    { id: "travel", label: "Travel", emoji: "✈️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="bg-white py-16">
        <Leaderboard />
      </div>
      
      {/* Hidden Referral System - Bottom section, hard to find */}
      <div className="bg-gray-100 py-8 border-t">
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

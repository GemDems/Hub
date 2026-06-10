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
import { ChevronDown, Dice6, Gift } from "lucide-react";

import Leaderboard from "@/components/leaderboard";
import ReferralSystem from "@/components/referral-system";
import LiveFeed from "@/components/live-feed";
import SavingsProgress from "@/components/savings-progress";
import IdeaSubmission from "@/components/idea-submission";
import AIChatbot from "@/components/ai-chatbot";
import ContactPopup from "@/components/contact-popup";
import { Link } from "wouter";

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


  // ─── Welcome-back returning visitor ───────────────────────────────────────
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  useEffect(() => {
    const last = localStorage.getItem("edh_last_visit");
    const now = Date.now();
    if (last && now - parseInt(last) > 60 * 60 * 1000) {
      // Been away > 1 hour — show welcome back
      setTimeout(() => setShowWelcomeBack(true), 2500);
      setTimeout(() => setShowWelcomeBack(false), 7000);
    }
    localStorage.setItem("edh_last_visit", now.toString());
  }, []);


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
      if (sortByClicks) return (b.clicks || 0) - (a.clicks || 0);
      return 0;
    });

  const categories = [
    { id: "all",     label: "All Deals",        emoji: "" },
    { id: "hot",     label: "Hot Deals",        emoji: "🔥" },
    { id: "tech",    label: "Tech & Gadgets",   emoji: "📱" },
    { id: "fashion", label: "Fashion",          emoji: "👔" },
    { id: "health",  label: "Health & Fitness", emoji: "💪" },
    { id: "travel",  label: "Travel",           emoji: "✈️" },
  ];

  const handleNewDropsClick = () => {
    setSortByClicks(true);
    setActiveCategory("all");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLeaderboardClick = () => {
    const el = document.querySelector('[data-section="leaderboard"]');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMyDealsClick = () => {
    const el = document.querySelector('[data-section="savings-progress"]');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRandomLink = () => {
    if (affiliateLinks.length === 0) return;
    const linksWithClicks = affiliateLinks.map(link => ({ ...link, clicks: link.clicks || 0 }));
    const sortedLinks = linksWithClicks.sort((a, b) => b.clicks - a.clicks);
    const totalWeight = sortedLinks.reduce((sum, _, index) => sum + (index < Math.ceil(sortedLinks.length * 0.6) ? 0.6 : 0.4), 0);
    let random = Math.random() * totalWeight;
    let selectedLink = sortedLinks[0];
    for (let i = 0; i < sortedLinks.length; i++) {
      const weight = i < Math.ceil(sortedLinks.length * 0.6) ? 0.6 : 0.4;
      if (random <= weight) { selectedLink = sortedLinks[i]; break; }
      random -= weight;
    }
    window.open(selectedLink.url, '_blank');
  };

  const handleDropdownCategorySelect = (category: string) => {
    setActiveCategory(category);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 2000;
      if (shouldShow && !showScrollButton && !hasExpired) {
        setShowScrollButton(true);
        setIsTimerActive(true);
        setTimerCount(5);
      }
      if (scrollY < 100) {
        setShowScrollButton(false);
        setIsTimerActive(false);
        setTimerCount(5);
        setHasExpired(false);
        setShowDropdown(false);
      }
      // Show review popup when near bottom of page
      const nearBottom = scrollY + window.innerHeight >= document.documentElement.scrollHeight - 200;
      if (nearBottom && !reviewDone && !showReviewPopup) {
        setShowReviewPopup(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollButton, hasExpired, reviewDone, showReviewPopup]);

  useEffect(() => {
    if (isTimerActive && timerCount > 0) {
      const timer = setTimeout(() => setTimerCount(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTimerActive && timerCount === 0) {
      setShowScrollButton(false);
      setIsTimerActive(false);
      setShowDropdown(false);
      setHasExpired(true);
    }
  }, [isTimerActive, timerCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="min-h-screen bg-gray-50">


      {/* ── WELCOME BACK NOTIFICATION ──────────────────────────────────── */}
      {showWelcomeBack && (
        <div className="fixed top-4 right-4 z-[9997] max-w-xs float-notif">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
            <Gift className="w-8 h-8 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">Welcome back! 🎉</div>
              <div className="text-xs opacity-90">New deals dropped since your last visit</div>
            </div>
          </div>
        </div>
      )}


      {/* Category Dropdown Menu */}
      <div className={`fixed top-4 left-4 z-50 transition-all duration-1000 ${showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <div className="relative dropdown-container">
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

      {/* Invisible Admin Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowAdmin(true)}
          className="w-16 h-16 bg-transparent hover:bg-transparent border-0 shadow-none opacity-0"
          title="Creator Mode"
        >
          <Settings className="w-4 h-4 opacity-0" />
        </Button>
      </div>

      <Header onSearch={setSearchQuery} />

      {/* Smooth color fade from dark header (#0d0f1a) to white page body */}
      <div
        style={{
          height: 80,
          background: "linear-gradient(to bottom, #0d0f1a 0%, #0d0f1a 10%, #1a1f36 35%, #4a4a6a 60%, #c0c0d8 80%, #ffffff 100%)",
          pointerEvents: "none",
          marginBottom: -1,
        }}
      />

      <StatsBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <h2 className="font-extrabold text-4xl sm:text-5xl mb-2" style={{ color: "#00008B" }}>
            Elite Deals Hub
          </h2>
          <p className="text-base sm:text-lg text-gray-700">
            <strong>Curated deals</strong> by industry experts. <strong>Limited quantities</strong> · Act fast!
          </p>
        </div>
        <SearchBar onSearch={setSearchQuery} links={affiliateLinks} />
        <CategoryFilter categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

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
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Let our AI assistant help you!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                  <button
                    onClick={() => {
                      const chatButton = document.querySelector('[data-chat-button]') as HTMLButtonElement;
                      if (chatButton) {
                        chatButton.click();
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
                  <button onClick={() => setSearchQuery("")} className="bg-conversion-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                    Clear Search
                  </button>
                </div>
                <p className="text-sm text-gray-500">Or try a different search term or browse our categories</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No deals available yet</h3>
                <p className="text-gray-600 mb-8">Use Creator Mode to add your first affiliate link!</p>
                <Button onClick={() => setShowAdmin(true)} className="bg-conversion-blue hover:bg-blue-700">
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

      <div className="bg-white pt-0 pb-10" data-section="leaderboard">
        <Leaderboard />
      </div>

      <div className="bg-gray-100 py-8 border-t" data-section="savings-progress">
        <div className="max-w-md mx-auto">
          <h2 className="text-center text-gray-500 text-xs mb-4 uppercase tracking-wider">Elite Access</h2>
          <ReferralSystem />
        </div>
      </div>

      <div className="bg-gray-900 py-16">
        <LiveFeed />
      </div>

      <div className="bg-gray-900 py-4">
        <div className="text-center">
          <button onClick={handleNewDropsClick} className="text-white text-sm mx-4 hover:text-blue-300 transition-colors underline">
            🔥 New Drops
          </button>
          <span className="text-gray-500">|</span>
          <button onClick={handleLeaderboardClick} className="text-white text-sm mx-4 hover:text-blue-300 transition-colors underline">
            🎁 View Leaderboard
          </button>
          <span className="text-gray-500">|</span>
          <button onClick={handleMyDealsClick} className="text-white text-sm mx-4 hover:text-blue-300 transition-colors underline">
            🛍️ My Deals
          </button>
        </div>
      </div>

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

      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-12">
        <div className="max-w-md mx-auto px-4">
          <IdeaSubmission />
        </div>
      </div>

      {/* Leave a Review popup — appears when user scrolls to bottom */}
      {showReviewPopup && !reviewDone && (
        <div className="fixed bottom-4 right-4 z-[9998] w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 animate-in slide-in-from-bottom">
          <button
            onClick={() => { setShowReviewPopup(false); setReviewDone(true); }}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >×</button>
          {reviewSuccess ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-bold text-gray-900 mb-1">Thanks for your review!</div>
              <div className="text-xs text-gray-500">It means a lot to us.</div>
            </div>
          ) : (
            <>
              <div className="font-bold text-gray-900 mb-1">Enjoying Elite Deals?</div>
              <div className="text-xs text-gray-500 mb-3">Leave a quick review — it helps others discover real deals.</div>
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)} className="text-2xl" style={{ color: s <= reviewRating ? "#f59e0b" : "#d1d5db", background: "none", border: "none", cursor: "pointer" }}>★</button>
                ))}
              </div>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-400"
                placeholder="Your name"
                value={reviewName}
                onChange={e => setReviewName(e.target.value)}
                maxLength={40}
              />
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Share your experience..."
                rows={3}
                value={reviewMsg}
                onChange={e => setReviewMsg(e.target.value)}
                maxLength={300}
              />
              <button
                disabled={reviewSubmitting || !reviewName.trim() || !reviewMsg.trim()}
                onClick={async () => {
                  if (!reviewName.trim() || !reviewMsg.trim()) return;
                  setReviewSubmitting(true);
                  try {
                    const deviceId = localStorage.getItem("deviceId") || `anon_${Date.now()}`;
                    await fetch("/api/reviews", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: reviewName.trim(), rating: reviewRating, message: reviewMsg.trim(), deviceId })
                    });
                    setReviewSuccess(true);
                    setTimeout(() => { setShowReviewPopup(false); setReviewDone(true); }, 2500);
                  } catch { setReviewSubmitting(false); }
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: reviewSubmitting ? "#9ca3af" : "linear-gradient(135deg,#1a237e,#3949ab)", border: "none", cursor: reviewSubmitting ? "not-allowed" : "pointer" }}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </>
          )}
        </div>
      )}

      <AdminPanel
        isOpen={showAdmin}
        onClose={() => setShowAdmin(false)}
        onSuccess={() => { refetch(); setShowAdmin(false); }}
      />

      <AIChatbot />

      {/* Site footer */}
      <div className="mt-10 pb-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <ContactPopup />
          <Link href="/about" className="text-xs hover:opacity-70 transition-opacity" style={{ color: "#4b5563", textDecoration: "none" }}>
            About Us &amp; Legal
          </Link>
        </div>
        <p className="text-xs" style={{ color: "#374151" }}>
          © {new Date().getFullYear()} Elite Deals Hub · Affiliate links may earn us a commission at no cost to you
        </p>
      </div>
    </div>
  );
}

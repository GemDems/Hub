import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface LiveStats {
  viewers: number;
  hourlyBuyers: number;
  timestamp: number;
}

export default function Header() {
  const [liveStats, setLiveStats] = useState<LiveStats>({
    viewers: 200,
    hourlyBuyers: 15,
    timestamp: Date.now()
  });

  const fetchLiveStats = async () => {
    try {
      const response = await fetch("/api/live-stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const stats = await response.json();
      
      // Update with server values, ensuring hourly buyers only increase
      setLiveStats(prev => ({
        viewers: stats.viewers,
        hourlyBuyers: Math.max(prev.hourlyBuyers, stats.hourlyBuyers),
        timestamp: stats.timestamp
      }));
    } catch (error) {
      console.error('Failed to fetch live stats:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchLiveStats();
    
    // Update every 8 seconds
    const interval = setInterval(fetchLiveStats, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Premium Alert Banner */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white text-center py-3 font-bold text-sm relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <span className="relative z-10 tracking-wide">🚀 JOIN 98.7% WHO GOT MORE THAN THEY EXPECTED — LIMITED ACCESS INSIDE ⚡</span>
      </div>
      {/* Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="text-center">
            {/* Main Title */}
            <div className="mb-6">
              <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4 tracking-tight">
                ELITE DEALS
              </h1>
              <div className="text-2xl md:text-3xl font-light text-blue-200 tracking-[0.2em] uppercase">
                Premium Marketplace
              </div>
            </div>
            
            {/* Tagline */}
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-6">
                <span className="font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text">
                  Curated by experts.
                </span>
                <span className="mx-2">•</span>
                <span className="font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
                  Verified authentic.
                </span>
                <span className="mx-2">•</span>
                <span className="font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
                  Trusted by thousands.
                </span>
              </p>
            </div>
          
            {/* Premium Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-sm border border-emerald-400/30 rounded-2xl px-6 py-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div className="text-emerald-300 font-bold text-sm">VERIFIED AUTHENTIC</div>
                  <div className="text-xs text-gray-400 mt-1">Every product vetted</div>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-yellow-400/30 rounded-2xl px-6 py-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="text-yellow-300 font-bold text-sm">4.9/5 RATING</div>
                  <div className="text-xs text-gray-400 mt-1">78K+ reviews</div>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-sm border border-purple-400/30 rounded-2xl px-6 py-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="text-purple-300 font-bold text-sm">#1 MARKETPLACE</div>
                  <div className="text-xs text-gray-400 mt-1">Industry leader</div>
                </div>
              </div>
              
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm border border-blue-400/30 rounded-2xl px-6 py-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div className="text-blue-300 font-bold text-sm">BANK-LEVEL SECURITY</div>
                  <div className="text-xs text-gray-400 mt-1">256-bit encryption</div>
                </div>
              </div>
            </div>
          
            {/* Live Activity Dashboard */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg border border-gray-600/30 rounded-3xl px-8 py-6 shadow-2xl max-w-3xl mx-auto mb-8">
              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <span className="font-bold text-white text-lg">{liveStats.viewers}</span>
                    <span className="text-gray-300 ml-2">live viewers</span>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-gray-600"></div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <span className="font-bold text-white text-lg">{liveStats.hourlyBuyers}</span>
                    <span className="text-gray-300 ml-2">orders this hour</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Proof Statement */}
            <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 backdrop-blur-sm border border-emerald-400/30 rounded-2xl px-8 py-4 max-w-2xl mx-auto shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text mb-1">
                  $6.2M+ SAVED
                </div>
                <div className="text-gray-300 text-sm">by our members this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

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
    <header className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
      {/* Clean Alert Banner */}
      <div className="bg-gradient-to-r from-urgency-red to-red-600 text-white text-center py-2 font-bold text-sm">
        <span>FLASH SALE: 70% OFF ENDS IN 3 HOURS</span>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">

          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent mb-3">
            Elite Deals Hub
          </h1>
          
          <div className="max-w-5xl mx-auto mb-8 px-4">
            <p className="text-xl text-gray-800 leading-[1.7] font-medium tracking-[0.02em] text-center" 
               style={{ 
                 fontFamily: '"Inter", "Roboto", system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                 fontWeight: '500',
                 letterSpacing: '0.02em'
               }}>
              <span className="inline-block font-bold text-trust-green tracking-[0.01em] px-2 py-1 rounded-md bg-trust-green/5 border border-trust-green/20 mr-3 shadow-sm">
                CURATED DEALS
              </span>
              <span className="text-gray-600 font-normal mx-2">BY INDUSTRY EXPERTS</span>
              
              <span className="block md:inline-block mt-3 md:mt-0">
                <span className="mx-0 md:mx-4 text-gray-400 hidden md:inline">|</span>
                <span className="inline-block font-bold text-action-orange tracking-[0.01em] px-2 py-1 rounded-md bg-action-orange/5 border border-action-orange/20 mr-3 shadow-sm">
                  LIMITED QUANTITIES
                </span>
                <span className="text-gray-500 mx-2">•</span>
                <span className="inline-block font-bold text-urgency-red tracking-[0.01em] px-2 py-1 rounded-md bg-urgency-red/5 border border-urgency-red/20 shadow-sm">
                  ACT FAST
                </span>
              </span>
            </p>
            
            {/* Professional spacing separator */}
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto mt-6"></div>
          </div>
          
          {/* Enhanced Trust Ecosystem */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-trust-green/10 to-trust-green/5 border border-trust-green/20 rounded-xl px-4 py-3">
              <div className="text-trust-green font-bold text-sm">✅ Verified Authentic</div>
              <div className="text-xs text-gray-600">Every deal verified</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
              <div className="text-yellow-800 font-bold text-sm">⭐ 4.9/5 Rating</div>
              <div className="text-xs text-gray-600">50K+ reviews</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 rounded-xl px-4 py-3">
              <div className="text-purple-800 font-bold text-sm">🏆 #1 Platform</div>
              <div className="text-xs text-gray-600">5 years running</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <div className="text-blue-800 font-bold text-sm">🔒 Bank Security</div>
              <div className="text-xs text-gray-600">SSL encrypted</div>
            </div>
          </div>
          
          {/* Live Activity Monitor */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-8 py-4 shadow-lg max-w-2xl mx-auto mb-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="font-bold text-gray-800">LIVE: {liveStats.viewers} viewing</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className="font-bold text-gray-800">{liveStats.hourlyBuyers} bought this hour</span>
              </div>
            </div>
          </div>
          
          {/* Clean Social Proof */}
          <div className="bg-white rounded-xl px-6 py-3 max-w-xl mx-auto shadow-sm border border-gray-200">
            <div className="text-gray-800 font-bold text-lg">
              Members Saved $4.7M This Month
            </div>
            <div className="text-sm text-gray-600">
              Average savings: $247 per member
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

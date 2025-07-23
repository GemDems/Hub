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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse movement for dynamic color effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

          
          <h1 
            className="dynamic-glass-text text-5xl font-bold mb-3 tracking-tight leading-tight enhanced-spacing-tight mouse-responsive"
            style={{
              filter: `hue-rotate(${mousePosition.x * 3.6}deg) brightness(${1 + mousePosition.y * 0.003})`,
              textShadow: `0 0 ${20 + mousePosition.x * 0.3}px rgba(255, 255, 255, ${0.3 + mousePosition.y * 0.002})`
            }}
          >
            Elite Deals Hub
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto mb-6 leading-relaxed text-[#202120] font-medium professional-spacing enhanced-spacing">
            <span className="dynamic-glass-text font-bold mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.x * 2}deg)` }}>Curated deals</span> by industry experts. 
            <span className="dynamic-glass-text font-bold mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.x * 4}deg)` }}>Limited quantities</span> 
            • <span className="dynamic-glass-text font-bold mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.x * 6}deg)` }}>Act fast!</span>
          </p>
          
          {/* Enhanced Trust Ecosystem */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-4xl mx-auto">
            <div className="glass-card border border-trust-green/20 rounded-xl px-4 py-3 mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.x * 1.5}deg)` }}>
              <div className="dynamic-glass-text font-bold text-sm enhanced-spacing">✅ Verified Authentic</div>
              <div className="text-xs text-gray-600 professional-spacing">Every deal verified</div>
            </div>
            <div className="glass-card border border-yellow-200 rounded-xl px-4 py-3 mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.x * 2.5}deg)` }}>
              <div className="dynamic-glass-text font-bold text-sm enhanced-spacing">⭐ 4.9/5 Rating</div>
              <div className="text-xs text-gray-600 professional-spacing">50K+ reviews</div>
            </div>
            <div className="glass-card border border-purple-200 rounded-xl px-4 py-3 mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.x * 3.5}deg)` }}>
              <div className="dynamic-glass-text font-bold text-sm enhanced-spacing">🏆 #1 Platform</div>
              <div className="text-xs text-gray-600 professional-spacing">5 years running</div>
            </div>
            <div className="glass-card border border-blue-200 rounded-xl px-4 py-3 mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.x * 4.5}deg)` }}>
              <div className="dynamic-glass-text font-bold text-sm enhanced-spacing">🔒 Bank Security</div>
              <div className="text-xs text-gray-600 professional-spacing">SSL encrypted</div>
            </div>
          </div>
          
          {/* Live Activity Monitor */}
          <div className="glass-card rounded-2xl px-8 py-4 shadow-lg max-w-2xl mx-auto mb-4 mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.y * 2}deg)` }}>
            <div className="flex items-center justify-center space-x-6 enhanced-spacing">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="dynamic-glass-text font-bold stats-text">LIVE: {liveStats.viewers} viewing</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className="dynamic-glass-text font-bold stats-text">{liveStats.hourlyBuyers} bought this hour</span>
              </div>
            </div>
          </div>
          
          {/* Clean Social Proof */}
          <div className="glass-card rounded-xl px-6 py-3 max-w-xl mx-auto shadow-sm mouse-responsive" style={{ filter: `hue-rotate(${mousePosition.y * 3}deg)` }}>
            <div className="dynamic-glass-text font-bold text-lg stats-text enhanced-spacing-tight">
              Members Saved $4.7M This Month
            </div>
            <div className="text-sm text-gray-600 professional-spacing">
              Average savings: $247 per member
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

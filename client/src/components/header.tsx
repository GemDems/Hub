import { useState, useEffect } from "react";

interface LiveStats {
  viewers: number;
  hourlyBuyers: number;
  timestamp: number;
}

// Randomly placed dark blue tint blobs for subconscious brand anchoring
const blueTints = [
  { top: "10%", left: "5%",  size: 120, opacity: 0.06 },
  { top: "60%", left: "80%", size: 90,  opacity: 0.05 },
  { top: "30%", left: "55%", size: 70,  opacity: 0.04 },
  { top: "75%", left: "20%", size: 100, opacity: 0.05 },
  { top: "20%", left: "90%", size: 60,  opacity: 0.04 },
];

export default function Header() {
  const [liveStats, setLiveStats] = useState<LiveStats>({
    viewers: 200,
    hourlyBuyers: 15,
    timestamp: Date.now()
  });

  // Rotating urgency sub-messages below banner
  const urgencyMessages = [
    `⚡ Only ${Math.floor(Math.random() * 30) + 12} spots left at this price`,
    `🔥 ${Math.floor(Math.random() * 40) + 60} people claimed in the last hour`,
    `⏳ Price increases when sale ends`,
    `👀 ${Math.floor(Math.random() * 20) + 8} people viewing this sale right now`,
  ];
  const [urgencyIdx, setUrgencyIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setUrgencyIdx(i => (i + 1) % urgencyMessages.length), 4000);
    return () => clearInterval(iv);
  }, []);

  // Drifting viewer count
  const [viewerDrift, setViewerDrift] = useState(0);
  useEffect(() => {
    const drift = setInterval(() => {
      setViewerDrift(Math.floor(Math.random() * 7) - 3);
    }, 6000);
    return () => clearInterval(drift);
  }, []);

  const fetchLiveStats = async () => {
    try {
      const response = await fetch("/api/live-stats");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const stats = await response.json();
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
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">

      {/* Randomly placed dark blue tint blobs — subconscious brand color anchoring */}
      {blueTints.map((tint, i) => (
        <div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            top: tint.top,
            left: tint.left,
            width: tint.size,
            height: tint.size,
            background: `radial-gradient(circle, rgba(30,58,138,${tint.opacity}) 0%, transparent 70%)`,
            transform: "translate(-50%, -50%)",
            zIndex: 0,
          }}
        />
      ))}

      {/* Rotating urgency sub-message */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center py-1 text-xs font-medium relative z-10 transition-all duration-500">
        <span key={urgencyIdx} className="proof-fade-in">{urgencyMessages[urgencyIdx]}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent mb-3">
            Elite Deals Hub
          </h1>

          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-2xl font-light text-gray-800 leading-relaxed tracking-wide mb-2">
              <span className="relative inline-block font-bold text-transparent bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text">
                Hand-picked deals
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-300 to-green-300 opacity-60"></span>
              </span>
              <span className="mx-3 font-normal">crafted by industry insiders</span>
            </p>
          </div>

          {/* Trust Ecosystem with shimmer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-trust-green/10 to-trust-green/5 border border-trust-green/20 rounded-xl px-4 py-3 relative overflow-hidden">
              <div className="trust-shimmer absolute inset-0 pointer-events-none rounded-xl"></div>
              <div className="text-trust-green font-bold text-sm relative z-10">✅ Verified Authentic</div>
              <div className="text-xs text-gray-600 relative z-10">Every deal verified</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 relative overflow-hidden">
              <div className="trust-shimmer absolute inset-0 pointer-events-none rounded-xl"></div>
              <div className="text-yellow-800 font-bold text-sm relative z-10">⭐ 4.9/5 Rating</div>
              <div className="text-xs text-gray-600 relative z-10">50,247 verified reviews</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-200 rounded-xl px-4 py-3 relative overflow-hidden">
              <div className="trust-shimmer absolute inset-0 pointer-events-none rounded-xl"></div>
              <div className="text-purple-800 font-bold text-sm relative z-10">🏆 #1 Platform</div>
              <div className="text-xs text-gray-600 relative z-10">5 years running</div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 rounded-xl px-4 py-3 relative overflow-hidden">
              <div className="trust-shimmer absolute inset-0 pointer-events-none rounded-xl"></div>
              <div className="text-blue-800 font-bold text-sm relative z-10">🔒 Bank Security</div>
              <div className="text-xs text-gray-600 relative z-10">SSL encrypted</div>
            </div>
          </div>

          {/* Live Activity Monitor */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-8 py-4 shadow-lg max-w-2xl mx-auto mb-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="font-bold text-gray-800">LIVE: {liveStats.viewers + viewerDrift} viewing</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className="font-bold text-gray-800">{liveStats.hourlyBuyers} bought this hour</span>
              </div>
            </div>
          </div>

          {/* Loss-framed savings proof */}
          <div className="bg-white rounded-xl px-6 py-3 max-w-xl mx-auto shadow-sm border border-gray-200">
            <div className="text-gray-800 font-bold text-lg">
              Members Saved $4.7M This Month
            </div>
            <div className="text-sm text-red-600 font-medium">
              Non-members are overpaying an average of $247/month
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

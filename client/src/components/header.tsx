import { useState, useEffect } from "react";

interface LiveStats {
  viewers: number;
  hourlyBuyers: number;
  timestamp: number;
}

export default function Header() {
  const [liveStats, setLiveStats] = useState<LiveStats>({
    viewers: 1035,
    hourlyBuyers: 708,
    timestamp: Date.now()
  });

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
    <header className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1117 0%, #0f172a 100%)" }}>
      {/* Top Announcement Banner */}
      <div style={{ background: "linear-gradient(90deg, #e53e3e 0%, #7c3aed 50%, #6d28d9 100%)" }} className="text-white text-center py-2 font-bold text-sm tracking-wide">
        🚀 JOIN 98.7% WHO GOT MORE THAN THEY EXPECTED — LIMITED ACCESS INSIDE ⚡
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">

        {/* Main Title */}
        <h1 className="font-black text-white mb-2 tracking-tight" style={{ fontSize: "clamp(3rem, 8vw, 5.5rem)", letterSpacing: "-0.02em" }}>
          ELITE DEALS
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 font-semibold tracking-widest text-sm sm:text-base mb-5" style={{ letterSpacing: "0.3em" }}>
          PREMIUM MARKETPLACE
        </p>

        {/* Tagline */}
        <p className="text-base sm:text-lg mb-8 font-medium">
          <span className="text-cyan-400 font-semibold">Curated by <span className="text-white">experts.</span></span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-cyan-400 font-semibold">Verified <span className="text-white">authentic.</span></span>
          <span className="text-gray-400 mx-2">•</span>
          <span className="text-cyan-400 font-semibold">Trusted by <span className="text-white">thousands.</span></span>
        </p>

        {/* Trust Badge Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-3xl mx-auto">
          {/* Verified Authentic */}
          <div className="rounded-xl px-4 py-4 flex flex-col items-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <span className="text-white text-lg">✓</span>
            </div>
            <div className="text-white font-bold text-xs tracking-wide uppercase">Verified Authentic</div>
            <div className="text-gray-400 text-xs mt-0.5">Every product vetted</div>
          </div>

          {/* Rating */}
          <div className="rounded-xl px-4 py-4 flex flex-col items-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
              <span className="text-white text-lg">★</span>
            </div>
            <div className="text-white font-bold text-xs tracking-wide uppercase">4.9/5 Rating</div>
            <div className="text-gray-400 text-xs mt-0.5">78K+ reviews</div>
          </div>

          {/* #1 Marketplace */}
          <div className="rounded-xl px-4 py-4 flex flex-col items-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}>
              <span className="text-white text-lg">🏆</span>
            </div>
            <div className="text-white font-bold text-xs tracking-wide uppercase">#1 Marketplace</div>
            <div className="text-gray-400 text-xs mt-0.5">Industry leader</div>
          </div>

          {/* Bank-Level Security */}
          <div className="rounded-xl px-4 py-4 flex flex-col items-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center mb-2" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
              <span className="text-white text-lg">🔒</span>
            </div>
            <div className="text-white font-bold text-xs tracking-wide uppercase">Bank-Level Security</div>
            <div className="text-gray-400 text-xs mt-0.5">256-bit encryption</div>
          </div>
        </div>

        {/* Live Activity Bar */}
        <div className="rounded-2xl px-8 py-4 mb-4 max-w-2xl mx-auto flex items-center justify-center gap-8" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-bold">{liveStats.viewers.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">live viewers</span>
          </div>
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-white font-bold">{liveStats.hourlyBuyers.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">orders this hour</span>
          </div>
        </div>

        {/* Savings Box */}
        <div className="rounded-2xl px-8 py-4 max-w-2xl mx-auto" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}>
          <div className="text-white font-black text-2xl sm:text-3xl">$6.2M+ SAVED</div>
          <div className="text-gray-400 text-sm mt-1">by our members this month</div>
        </div>
      </div>

      {/* Bottom Trust Strip */}
      <div className="border-t py-2 text-center text-sm text-gray-400" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
        ✅ Every Deal Verified &bull; No Fake Offers
      </div>
    </header>
  );
}

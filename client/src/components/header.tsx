import { useState, useEffect } from "react";

export default function Header() {
  const [liveViewers, setLiveViewers] = useState(Math.floor(Math.random() * 300) + 200);
  const [hourlyBuyers, setHourlyBuyers] = useState(Math.floor(Math.random() * 50) + 30);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers(prev => prev + Math.floor(Math.random() * 10) - 5);
      setHourlyBuyers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
      {/* Urgent Scarcity Alert Banner */}
      <div className="bg-gradient-to-r from-urgency-red via-red-600 to-urgency-red text-white text-center py-2 font-bold text-sm animate-pulse relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-ping"></div>
        <span className="relative">⚠️ FLASH SALE: 70% OFF ENDS IN 3 HOURS - ONLY 47 ITEMS LEFT! ⚠️</span>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          {/* Premium Branding */}
          <div className="mb-3">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-xs font-bold shadow-lg">
              👑 PREMIUM MEMBER EXCLUSIVE ACCESS
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent mb-3">
            💎 Elite Deals Hub 💎
            <span className="text-urgency-red animate-pulse ml-3">🔥</span>
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6 leading-relaxed">
            🎯 <span className="font-bold text-trust-green">Handcrafted VIP deals</span> by industry experts. 
            <span className="font-bold text-action-orange">Ultra-limited quantities</span> 
            • <span className="font-bold text-urgency-red">Reserved for members only!</span>
          </p>
          
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
          <div className="bg-gradient-to-r from-urgency-red to-red-600 rounded-2xl px-8 py-4 text-white shadow-2xl max-w-2xl mx-auto mb-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
                <span className="font-bold">🔴 LIVE: {liveViewers} viewing</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mr-2"></div>
                <span className="font-bold">⚡ {hourlyBuyers} bought this hour</span>
              </div>
            </div>
          </div>
          
          {/* Social Proof Mega Counter */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-6 py-3 max-w-xl mx-auto">
            <div className="text-gray-800 font-bold text-lg">
              💰 Members Saved $4.7M This Month
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

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
      {/* Clean Alert Banner */}
      <div className="bg-gradient-to-r from-urgency-red to-red-600 text-white text-center py-2 font-bold text-sm">
        <span>FLASH SALE: 70% OFF ENDS IN 3 HOURS</span>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">

          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent mb-3">
            Elite Deals Hub
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-6 leading-relaxed">
            <span className="font-bold text-trust-green">Curated deals</span> by industry experts. 
            <span className="font-bold text-action-orange">Limited quantities</span> 
            • <span className="font-bold text-urgency-red">Act fast!</span>
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

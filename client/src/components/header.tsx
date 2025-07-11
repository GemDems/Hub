export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative overflow-hidden">
      {/* Scarcity Alert Banner */}
      <div className="bg-gradient-to-r from-urgency-red to-red-600 text-white text-center py-2 font-bold text-sm animate-pulse">
        ⚠️ FLASH SALE: 70% OFF ENDS IN 4 HOURS - DON'T MISS OUT! ⚠️
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            💎 Elite Deals Hub 💎
            <span className="text-urgency-red animate-pulse ml-2">🔥</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            🎯 <span className="font-bold text-trust-green">Exclusive VIP deals</span> handpicked by experts. 
            <span className="font-semibold text-action-orange"> Limited quantities</span> 
            - <span className="font-bold text-urgency-red">Act fast before they're gone!</span>
          </p>
          
          {/* Trust Badges */}
          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="flex items-center bg-trust-green/10 text-trust-green px-3 py-1 rounded-full text-sm font-medium">
              ✅ Verified Deals
            </div>
            <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              ⭐ 4.9/5 Rating
            </div>
            <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              🏆 #1 Deal Site
            </div>
          </div>
          
          {/* Enhanced Urgency Banner */}
          <div className="mt-4 inline-flex items-center bg-gradient-to-r from-urgency-red to-red-600 text-white px-6 py-3 rounded-full text-sm font-medium animate-pulse shadow-lg">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>🔴 LIVE: {Math.floor(Math.random() * 300) + 200} people viewing • {Math.floor(Math.random() * 50) + 30} bought in last hour</span>
          </div>
          
          {/* Social Proof Counter */}
          <div className="mt-2 text-sm text-gray-500">
            💰 Over $2.3M saved by our community this month
          </div>
        </div>
      </div>
    </header>
  );
}

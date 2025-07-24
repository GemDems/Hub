import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface LiveStats {
  viewers: number;
  hourlyBuyers: number;
  timestamp: number;
}

// Individual Digit Animation Component
function AnimatedDigit({ digit, isAnimating }: { digit: string; isAnimating: boolean }) {
  return (
    <span 
      className={`
        inline-block font-bold text-gray-800
        ${isAnimating ? 'spin-digit' : ''}
      `}
      style={{
        display: 'inline-block',
        minWidth: '1ch',
        transformOrigin: 'center center'
      }}
    >
      {digit}
    </span>
  );
}

// Animated Number Component with individual digit spinning
function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animatingDigits, setAnimatingDigits] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (value !== displayValue) {
      console.log(`Number changing from ${displayValue} to ${value}`);
      
      const oldDigits = displayValue.toString().split('');
      const newDigits = value.toString().split('');
      const maxLength = Math.max(oldDigits.length, newDigits.length);
      
      // Pad with zeros for comparison
      while (oldDigits.length < maxLength) oldDigits.unshift('0');
      while (newDigits.length < maxLength) newDigits.unshift('0');
      
      // Find which digits changed
      const changedDigits = new Set<number>();
      for (let i = 0; i < maxLength; i++) {
        if (oldDigits[i] !== newDigits[i]) {
          changedDigits.add(i);
        }
      }
      
      setAnimatingDigits(changedDigits);
      
      // Update value mid-animation
      setTimeout(() => {
        setDisplayValue(value);
      }, 350);
      
      // Stop animation
      setTimeout(() => {
        setAnimatingDigits(new Set());
      }, 700);
    }
  }, [value, displayValue]);

  const digits = displayValue.toString().split('');
  
  return (
    <span className={`inline-block ${className}`}>
      {digits.map((digit, index) => (
        <AnimatedDigit 
          key={`${displayValue}-${index}`}
          digit={digit}
          isAnimating={animatingDigits.has(digits.length - 1 - index)}
        />
      ))}
    </span>
  );
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
          
          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-2xl font-light text-gray-800 leading-relaxed tracking-wide mb-2">
              <span className="relative inline-block font-bold text-transparent bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text">
                Hand-picked deals
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-300 to-green-300 opacity-60"></span>
              </span>
              <span className="mx-3 font-normal">crafted by industry insiders</span>
            </p>
            
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
                <span className="font-bold text-gray-800">LIVE: <AnimatedNumber value={liveStats.viewers} /> viewing</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className="font-bold text-gray-800"><AnimatedNumber value={liveStats.hourlyBuyers} /> bought this hour</span>
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

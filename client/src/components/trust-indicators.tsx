import { Shield, Clock, Percent, Star } from "lucide-react";
import { useState, useEffect } from "react";

export default function TrustIndicators() {
  const [currentReview, setCurrentReview] = useState({ user: "", visible: false });
  
  const reviewUsers = [
    "Sarah M", "David K", "Emma R", "James L", "Maya P", "Alex C", "Nina S", "Ryan T",
    "Lisa W", "Mike B", "Zoe H", "Sam D", "Aria F", "Josh N", "Chloe V", "Tyler G"
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      const randomUser = reviewUsers[Math.floor(Math.random() * reviewUsers.length)];
      setCurrentReview({ user: randomUser, visible: true });
      
      setTimeout(() => {
        setCurrentReview(prev => ({ ...prev, visible: false }));
      }, 3000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
      {/* Nike-style Bold Text Section */}
      <div className="mb-8 overflow-hidden text-center">
        <div className="nike-steroids-text">
          LIKE STEROIDS*
        </div>
        <div className="text-gray-500 text-sm mt-2 italic">
          *but it's 100% safe (pinky promise)
        </div>
      </div>

      {/* Guarantee Section */}
      <div className="mb-8 text-center">
        <div className="guarantee-text">
          If the deal isn't real, I'll personally find you a better one — or send it to you free.
        </div>
      </div>

      <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Choose Elite Deals Hub?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-trust-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white text-2xl w-8 h-8" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Verified Deals Only</h4>
          <p className="text-gray-600 text-sm">Every deal is manually verified for authenticity and value.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-conversion-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="text-white text-2xl w-8 h-8" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Real-Time Updates</h4>
          <p className="text-gray-600 text-sm">Deals updated every few minutes to ensure availability.</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-action-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <Percent className="text-white text-2xl w-8 h-8" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Maximum Savings</h4>
          <p className="text-gray-600 text-sm">We negotiate exclusive discounts you won't find elsewhere.</p>
        </div>
      </div>
    </div>
  );
}

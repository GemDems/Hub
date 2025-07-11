import { Users, Shield, Zap, TrendingUp, Award, DollarSign } from "lucide-react";

export default function StatsBar() {
  return (
    <div className="bg-gradient-to-r from-trust-green via-conversion-blue to-purple-600 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-8 text-sm font-medium">
          <div className="flex items-center animate-pulse">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-[#3d445c]">💎 {(Math.floor(Math.random() * 5000) + 15000).toLocaleString()} VIP Members</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-[#4b5563]">🔒 100% Secure & Verified</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="text-[#4b5563]">📈 {Math.floor(Math.random() * 200) + 500} deals sold today</span>
          </div>
          <div className="flex items-center">
            <Award className="w-4 h-4 mr-2" />
            <span>🏆 #1 Rated Deal Platform</span>
          </div>
          <div className="flex items-center animate-pulse">
            <DollarSign className="w-4 h-4 mr-2" />
            <span>💰 Avg. savings: ${Math.floor(Math.random() * 100) + 150}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

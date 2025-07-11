import { Users, Shield, Zap } from "lucide-react";

export default function StatsBar() {
  return (
    <div className="bg-gradient-to-r from-trust-green to-conversion-blue text-white py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-8 text-sm font-medium">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span>{(Math.floor(Math.random() * 5000) + 10000).toLocaleString()} Happy Customers</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span>Verified Deals Only</span>
          </div>
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            <span>Updated {Math.floor(Math.random() * 10) + 1} min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

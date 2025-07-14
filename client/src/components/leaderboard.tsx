import { useState, useEffect } from "react";
import { Trophy, Star, Crown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import SavingsProgress from "./savings-progress";

export default function Leaderboard() {
  // Fetch real leaderboard data from API
  const { data: leaderboardData } = useQuery({
    queryKey: ["/api/leaderboard"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const topSavers = leaderboardData?.topSavers || [];
  const topReferrers = leaderboardData?.topReferrers || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12" data-leaderboard>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-4">
          Elite Performance Leaderboard
        </h2>
        <p className="text-gray-600 text-lg">
          Top performers this month • Updates live every few minutes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Savers */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-2xl font-bold">Top 10 Savers This Month</h3>
                <p className="text-green-100">Verified elite deal hunters</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {topSavers.map((saver, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {index === 0 && <Crown className="w-6 h-6 text-yellow-500 mr-2" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-gray-400 mr-2" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-amber-600 mr-2" />}
                    {index > 2 && <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 mr-2">{index + 1}</span>}
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold text-blue-900">{saver.username}</span>
                      <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                    </div>
                    <div className="text-sm text-gray-500">VIP Member</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${saver.totalSavings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">saved</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Money Saved Tracker - Minimal Design */}
      <div className="max-w-md mx-auto px-4 py-2">
        <SavingsProgress />
      </div>

      <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto px-4">
        {/* Top VIP Referrers */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-2xl font-bold">Top VIP Referrers</h3>
                <p className="text-purple-100">Elite club members only</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {topReferrers.map((referrer, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="flex items-center mr-4">
                    {index === 0 && <Crown className="w-6 h-6 text-yellow-500 mr-2" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-gray-400 mr-2" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-amber-600 mr-2" />}
                    {index > 2 && <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 mr-2">{index + 1}</span>}
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <span className="font-bold text-blue-900">{referrer.username}</span>
                      <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                    </div>
                    <div className="text-sm text-gray-500">VIP Member</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {referrer.referralCount} Leaderboard Invites Used
                  </div>
                  <div className="text-xs text-gray-500">
                    Elite VIP Member
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Trophy, Crown, DollarSign, Users } from "lucide-react";

export default function Leaderboard() {
  // Get leaderboard data
  const { data: leaderboard } = useQuery({
    queryKey: ["/api/leaderboard"],
    retry: false,
  });

  const topSavers = leaderboard?.topSavers || [];
  const topReferrers = leaderboard?.topReferrers || [];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto p-6">
      {/* Top Savers Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold">Top 10 Savers This Month</h3>
        </div>
        <div className="space-y-3">
          {topSavers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No data yet</p>
          ) : (
            topSavers.map((user: any, index: number) => (
              <div 
                key={user.userId} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                  index === 1 ? 'bg-gray-100 border border-gray-300' :
                  index === 2 ? 'bg-orange-100 border border-orange-300' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                    {index === 0 && <Trophy className="w-4 h-4 text-yellow-600" />}
                    {index === 1 && <Trophy className="w-4 h-4 text-gray-600" />}
                    {index === 2 && <Trophy className="w-4 h-4 text-orange-600" />}
                    {index > 2 && <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.isVip ? (
                        <span className="flex items-center gap-1">
                          <Crown className="w-3 h-3 text-yellow-600" />
                          User #{user.userId.slice(-4)}
                        </span>
                      ) : (
                        `User #${user.userId.slice(-4)}`
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${user.totalSavings}</p>
                  <p className="text-xs text-gray-500">saved</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Top Referrers Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-conversion-blue" />
          <h3 className="text-lg font-bold">Top VIP Referrers</h3>
        </div>
        <div className="space-y-3">
          {topReferrers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No VIP members yet</p>
          ) : (
            topReferrers.map((user: any, index: number) => (
              <div 
                key={user.userId} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-blue-100 border-2 border-blue-300' :
                  index === 1 ? 'bg-gray-100 border border-gray-300' :
                  index === 2 ? 'bg-purple-100 border border-purple-300' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
                    {index === 0 && <Crown className="w-4 h-4 text-yellow-600" />}
                    {index === 1 && <Crown className="w-4 h-4 text-gray-600" />}
                    {index === 2 && <Crown className="w-4 h-4 text-purple-600" />}
                    {index > 2 && <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-600" />
                      VIP #{user.userId.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-conversion-blue">{user.referralCount}</p>
                  <p className="text-xs text-gray-500">referrals</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
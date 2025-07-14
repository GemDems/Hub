import { useState, useEffect } from "react";
import { Trophy, Star, Crown, TrendingUp } from "lucide-react";

// Realistic static leaderboard data that persists
const STATIC_LEADERBOARD_DATA = {
  topSavers: [
    { name: "Michael R.", savings: 2847, location: "California", isVip: true },
    { name: "Sarah K.", savings: 2634, location: "Texas", isVip: true },
    { name: "David L.", savings: 2291, location: "New York", isVip: true },
    { name: "Jennifer M.", savings: 2156, location: "Florida", isVip: false },
    { name: "Robert P.", savings: 2089, location: "Illinois", isVip: true },
    { name: "Lisa W.", savings: 1967, location: "Arizona", isVip: false },
    { name: "James T.", savings: 1834, location: "Ohio", isVip: true },
    { name: "Amanda S.", savings: 1723, location: "Georgia", isVip: false },
    { name: "Chris B.", savings: 1645, location: "Michigan", isVip: false },
    { name: "Maria G.", savings: 1589, location: "Nevada", isVip: true }
  ],
  topReferrers: [
    { name: "Sarah K.", referrals: 47, earnings: 1420, location: "Texas" },
    { name: "Michael R.", referrals: 43, earnings: 1290, location: "California" },
    { name: "David L.", referrals: 39, earnings: 1170, location: "New York" },
    { name: "Robert P.", referrals: 36, earnings: 1080, location: "Illinois" },
    { name: "James T.", referrals: 31, earnings: 930, location: "Ohio" },
    { name: "Maria G.", referrals: 28, earnings: 840, location: "Nevada" },
    { name: "Ashley D.", referrals: 24, earnings: 720, location: "Colorado" },
    { name: "Kevin H.", referrals: 21, earnings: 630, location: "Washington" },
    { name: "Nicole F.", referrals: 19, earnings: 570, location: "Oregon" },
    { name: "Brandon C.", referrals: 17, earnings: 510, location: "Virginia" }
  ]
};

export default function Leaderboard() {
  const [topSavers, setTopSavers] = useState(STATIC_LEADERBOARD_DATA.topSavers);
  const [topReferrers, setTopReferrers] = useState(STATIC_LEADERBOARD_DATA.topReferrers);

  // Simulate realistic updates every 2-3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      // Small realistic increases to existing data
      setTopSavers(prev => prev.map(saver => ({
        ...saver,
        savings: saver.savings + Math.floor(Math.random() * 15) + 5 // $5-20 increase
      })));

      setTopReferrers(prev => prev.map(referrer => {
        const newReferrals = Math.random() < 0.3 ? 1 : 0; // 30% chance of +1 referral
        return {
          ...referrer,
          referrals: referrer.referrals + newReferrals,
          earnings: referrer.earnings + (newReferrals * 30) // $30 per referral
        };
      }));
    }, 150000); // Update every 2.5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
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
                      <span className="font-semibold text-gray-900">{saver.name}</span>
                      {saver.isVip && <Crown className="w-4 h-4 text-yellow-500 ml-2" />}
                    </div>
                    <div className="text-sm text-gray-500">{saver.location}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ${saver.savings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">saved</div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                      <span className="font-semibold text-gray-900">{referrer.name}</span>
                      <Crown className="w-4 h-4 text-yellow-500 ml-2" />
                    </div>
                    <div className="text-sm text-gray-500">{referrer.location}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600">
                    {referrer.referrals} invites
                  </div>
                  <div className="text-xs text-gray-500">
                    ${referrer.earnings} earned
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
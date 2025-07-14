import { Card } from "@/components/ui/card";

interface MiniNavigationProps {
  onNewDropsClick: () => void;
  onLeaderboardClick: () => void;
  onMyDealsClick: () => void;
}

export default function MiniNavigation({ onNewDropsClick, onLeaderboardClick, onMyDealsClick }: MiniNavigationProps) {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onNewDropsClick}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 hover:bg-white/90 border transition-all duration-300 hover:shadow-lg hover:scale-105 group overflow-hidden"
          >
            <span className="text-lg">🔥</span>
            <span className="font-medium text-conversion-blue group-hover:text-blue-700 transition-colors z-10 relative">
              New Drops
            </span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-400/30 to-red-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </button>

          <button
            onClick={onLeaderboardClick}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 hover:bg-white/90 border transition-all duration-300 hover:shadow-lg hover:scale-105 group overflow-hidden"
          >
            <span className="text-lg">🎁</span>
            <span className="font-medium text-conversion-blue group-hover:text-blue-700 transition-colors z-10 relative">
              View Leaderboard
            </span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/30 to-orange-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </button>

          <button
            onClick={onMyDealsClick}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 hover:bg-white/90 border transition-all duration-300 hover:shadow-lg hover:scale-105 group overflow-hidden"
          >
            <span className="text-lg">🛍️</span>
            <span className="font-medium text-conversion-blue group-hover:text-blue-700 transition-colors z-10 relative">
              My Deals
            </span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/30 to-blue-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
          </button>
        </div>
      </Card>
    </div>
  );
}
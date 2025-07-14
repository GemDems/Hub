import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Gift, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Generate persistent device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('elite_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('elite_device_id', deviceId);
  }
  return deviceId;
};

export default function SavingsProgress() {
  const [progress, setProgress] = useState(() => {
    return parseInt(localStorage.getItem('savings_progress') || '0');
  });
  const [hasSeinfeldCode, setHasSeinfeldCode] = useState(() => {
    return localStorage.getItem('has_seinfeld_code') === 'true';
  });
  const { toast } = useToast();

  const progressPercentage = Math.min((progress / 1000) * 100, 100);
  const remainingAmount = Math.max(1000 - progress, 0);
  
  // Dynamic color based on progress
  const getProgressColor = () => {
    if (progress >= 800) return "from-emerald-600 to-green-500"; // Final push - bright green
    if (progress >= 600) return "from-blue-600 to-emerald-500"; // Getting close - blue to green
    if (progress >= 400) return "from-indigo-600 to-blue-500"; // Halfway - deeper blue
    if (progress >= 200) return "from-purple-600 to-indigo-500"; // Early progress - purple to blue
    return "from-slate-600 to-purple-500"; // Starting out - slate to purple
  };
  
  // Milestone markers
  const milestones = [200, 400, 600, 800];
  const getMilestoneStyle = (milestone: number) => {
    const isReached = progress >= milestone;
    return {
      left: `${(milestone / 1000) * 100}%`,
      className: isReached 
        ? "w-2 h-2 bg-emerald-500 rounded-full border-2 border-white shadow-md" 
        : "w-2 h-2 bg-gray-300 rounded-full border-2 border-white shadow-sm"
    };
  };

  // Update savings progress when user clicks "Get Deal Now"
  const updateProgress = (amount: number) => {
    const newProgress = progress + amount;
    setProgress(newProgress);
    localStorage.setItem('savings_progress', newProgress.toString());

    // Check for Level 1 reward unlock
    if (newProgress >= 1000 && progress < 1000 && !hasSeinfeldCode) {
      setHasSeinfeldCode(true);
      localStorage.setItem('has_seinfeld_code', 'true');
      
      // Generate Seinfeld code and bonus referral code
      const seinfeldCode = `SEIN${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const bonusCode = `BONUS${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
      localStorage.setItem('seinfeld_code', seinfeldCode);
      localStorage.setItem('bonus_referral_code', bonusCode);
      
      toast({
        title: "🏆 SECRET PRIZE UNLOCKED!",
        description: `Level 1 Seinfeld Code: ${seinfeldCode} + Bonus Referral Code: ${bonusCode}`,
        className: "bg-purple-50 border-purple-200",
        duration: 10000,
      });
    }
  };

  // Expose updateProgress globally so affiliate cards can use it
  useEffect(() => {
    (window as any).updateSavingsProgress = updateProgress;
  }, [progress, hasSeinfeldCode]);

  const scrollToLeaderboard = () => {
    const leaderboardElement = document.querySelector('[data-leaderboard]');
    if (leaderboardElement) {
      leaderboardElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center space-x-3 mb-3">
        <span className={`text-sm font-semibold bg-gradient-to-r ${getProgressColor()} bg-clip-text text-transparent drop-shadow-sm transition-all duration-500`}>Money Saved:</span>
        <span className={`text-base font-semibold bg-gradient-to-r ${getProgressColor()} bg-clip-text text-transparent drop-shadow-sm transition-all duration-500`}>${progress.toLocaleString()}</span>
      </div>
      
      <div className="relative mb-4">
        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className="h-3 bg-gray-100 shadow-inner rounded-full overflow-hidden" 
            style={{
              background: `linear-gradient(to right, rgb(${progress >= 800 ? '16, 185, 129' : progress >= 600 ? '37, 99, 235' : progress >= 400 ? '79, 70, 229' : progress >= 200 ? '124, 58, 237' : '71, 85, 105'}) ${progressPercentage}%, rgb(243, 244, 246) ${progressPercentage}%)`
            }}
          />
          
          {/* Milestone markers */}
          <div className="absolute top-0 left-0 w-full h-full">
            {milestones.map((milestone) => {
              const style = getMilestoneStyle(milestone);
              return (
                <div
                  key={milestone}
                  className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${style.className} transition-all duration-300`}
                  style={{ left: style.left }}
                />
              );
            })}
          </div>
        </div>
        
        {/* Progress labels with milestones */}
        <div className="flex justify-between items-center mt-2">
          <span className={`text-xs font-semibold bg-gradient-to-r ${getProgressColor()} bg-clip-text text-transparent transition-all duration-500`}>$0</span>
          <span className="text-xs font-medium text-gray-600">$200</span>
          <span className="text-xs font-medium text-gray-600">$400</span>
          <span className="text-xs font-medium text-gray-600">$600</span>
          <span className="text-xs font-medium text-gray-600">$800</span>
          <span className={`text-xs font-semibold bg-gradient-to-r ${getProgressColor()} bg-clip-text text-transparent transition-all duration-500`}>$1,000</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-1 font-normal">
        👉 Every "Get Deal Now" increases your amount saved
      </div>
      
      <button 
        onClick={scrollToLeaderboard}
        className="text-xs font-normal text-gray-700 hover:text-blue-600 underline cursor-pointer transition-colors"
      >
        Goal: Hit the leaderboard
      </button>

      {hasSeinfeldCode && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-xs font-medium text-green-800 mb-2">
            🎁 Secret Rewards Unlocked!
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono bg-green-100 rounded px-2 py-1 text-green-700">
              Seinfeld: {localStorage.getItem('seinfeld_code')}
            </div>
            <div className="text-xs font-mono bg-purple-100 rounded px-2 py-1 text-purple-700">
              Bonus: {localStorage.getItem('bonus_referral_code')}
            </div>
          </div>
          <div className="text-xs text-green-600 mt-1 font-medium">
            Double referral points + Extra code
          </div>
        </div>
      )}
    </div>
  );
}
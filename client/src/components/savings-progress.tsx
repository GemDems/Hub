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
  const [showPercentage, setShowPercentage] = useState(false);
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
  
  // Simple milestones - easier goals
  const milestones = [100, 300, 500, 750];
  const getMilestoneStyle = (milestone: number) => {
    const isReached = progress >= milestone;
    return {
      left: `${(milestone / 1000) * 100}%`,
      className: isReached 
        ? "w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform hover:scale-110 transition-all" 
        : "w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow-sm cursor-pointer hover:bg-gray-500 transition-all"
    };
  };

  const handleMilestoneClick = (milestone: number) => {
    const percentage = Math.round((milestone / 1000) * 100);
    const remaining = Math.round(((1000 - progress) / 1000) * 100);
    setShowPercentage(true);
    toast({
      title: `$${milestone} Checkpoint`,
      description: `${percentage}% of goal • ${remaining}% to unlock rewards!`,
      duration: 3000,
    });
    setTimeout(() => setShowPercentage(false), 3000);
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
        title: "🎉 SURPRISE REWARDS UNLOCKED!",
        description: `Seinfeld Code: ${seinfeldCode} (Double Points!) + Secret Device Code: ${bonusCode} - Share with same people for DOUBLE referral points!`,
        className: "bg-purple-50 border-purple-200",
        duration: 12000,
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
    <div className="text-center py-3">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <span className="text-base font-medium text-gray-800">${progress.toLocaleString()}</span>
        <span className="text-sm text-gray-500">/ $1,000</span>
        {showPercentage && (
          <span className="text-sm font-medium text-green-600">
            {Math.round(progressPercentage)}% done
          </span>
        )}
      </div>
      
      <div className="relative mb-2 px-2">
        <div className="relative bg-gray-200 rounded-full h-3">
          <div 
            className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Simple milestone dots */}
          <div className="absolute top-0 left-0 w-full h-full">
            {milestones.map((milestone) => {
              const style = getMilestoneStyle(milestone);
              return (
                <button
                  key={milestone}
                  onClick={() => handleMilestoneClick(milestone)}
                  className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 ${style.className}`}
                  style={{ left: style.left }}
                />
              );
            })}
          </div>
          
          {/* Goal indicator */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1">
            <span className={`text-sm transition-all duration-500 ${progress >= 1000 ? 'scale-110' : 'scale-100'} ${progress >= 900 ? 'opacity-100' : 'opacity-60'}`}>🎁</span>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-600 mb-1">
        Every purchase counts toward your goal
      </div>
      
      <div className="text-xs text-purple-600 mb-2 font-medium">
        Secret reward at $1,000
      </div>
      
      <button 
        onClick={scrollToLeaderboard}
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        View leaderboard
      </button>

      {hasSeinfeldCode && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-xs font-medium text-green-800 mb-2">
            🎁 Secret Rewards Unlocked!
          </div>
          <div className="space-y-2">
            <div className="text-xs font-mono bg-green-100 rounded px-2 py-1 text-green-700">
              Seinfeld: {localStorage.getItem('seinfeld_code')} (Double Points!)
            </div>
            <div className="text-xs font-mono bg-purple-100 rounded px-2 py-1 text-purple-700">
              Device Code: {localStorage.getItem('bonus_referral_code')}
            </div>
          </div>
          <div className="text-xs text-purple-600 mt-2 font-medium bg-purple-50 rounded p-2">
            💡 Your Device Code: Share with same people for DOUBLE referral points! Use only on this device to hit leaderboard faster!
          </div>
        </div>
      )}
    </div>
  );
}
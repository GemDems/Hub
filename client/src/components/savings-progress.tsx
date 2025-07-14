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
      <div className="flex items-center justify-center space-x-3 mb-2">
        <span className="text-sm font-black bg-gradient-to-r from-blue-900 to-green-600 bg-clip-text text-transparent drop-shadow-sm">Money Saved:</span>
        <span className="text-base font-black bg-gradient-to-r from-blue-900 to-green-600 bg-clip-text text-transparent drop-shadow-sm">${progress.toLocaleString()}</span>
      </div>
      
      <div className="relative mb-2">
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-gray-100 shadow-sm" 
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs font-black bg-gradient-to-r from-blue-900 to-green-600 bg-clip-text text-transparent drop-shadow-sm">$0</span>
          <span className="text-xs font-black bg-gradient-to-r from-blue-900 to-green-600 bg-clip-text text-transparent drop-shadow-sm">$1,000</span>
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
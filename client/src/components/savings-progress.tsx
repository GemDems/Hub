import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Gift, Zap, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

// Generate persistent device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('elite_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('elite_device_id', deviceId);
  }
  return deviceId;
};

// Component to show reward codes from database  
function SavingsRewardCodes() {
  // For testing, use the device ID that has bonus codes
  const deviceId = 'POB2I6Y8'; // getDeviceId();
  const { toast } = useToast();
  
  const { data: referralStatus, isLoading } = useQuery({
    queryKey: ["/api/referral/status", deviceId],
    queryFn: () => fetch(`/api/referral/status?userId=${deviceId}`).then(res => res.json()),
    refetchInterval: 5000,
  });

  // Debug logs
  console.log('Device ID:', deviceId);
  console.log('Referral Status:', referralStatus);
  console.log('Reward Codes:', referralStatus?.rewardCodes);

  if (isLoading) {
    return (
      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
        <div className="text-xs text-gray-600">Loading bonus codes...</div>
      </div>
    );
  }

  if (!referralStatus?.rewardCodes || referralStatus.rewardCodes.length === 0) {
    return (
      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <div className="text-xs text-yellow-800">No bonus codes available yet. Bonus codes appear when you reach $1,000 saved!</div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-sm">
      <div className="text-sm font-bold text-purple-800 mb-3 text-center">
        🎁 BONUS REFERRAL CODES UNLOCKED! 🎁
      </div>
      <div className="space-y-3">
        {referralStatus.rewardCodes.map((code: any, index: number) => (
          <div key={code.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border-2 border-purple-100 shadow-sm">
            <div className="flex-1">
              <div className="text-sm font-bold text-purple-700">
                {(code.codeType === "bonus_2x" || code.codeType === "seinfeld") && `BONUS CODE 1: ${code.code}`}
                {(code.codeType === "bonus_regular" || code.codeType === "double_points") && `BONUS CODE 2: ${code.code}`}
              </div>
              <div className="text-xs font-semibold">
                {(code.codeType === "bonus_2x" || code.codeType === "seinfeld") && (
                  <span className="text-green-600">✨ 2X BONUS POINTS! ✨</span>
                )}
                {(code.codeType === "bonus_regular" || code.codeType === "double_points") && (
                  <span className="text-blue-600">📈 REGULAR POINTS</span>
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(code.code);
                toast({ 
                  title: "✅ COPIED!", 
                  description: `Code ${code.code} copied! Share it to get referral points!`,
                  className: "bg-green-50 border-green-200"
                });
              }}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1"
            >
              📋 COPY
            </Button>
          </div>
        ))}
      </div>
      <div className="text-xs text-purple-700 mt-3 font-semibold bg-purple-100 rounded-lg p-3 text-center">
        💡 SHARE THESE CODES: Go to VIP Member section and share these codes with friends! 
        They work just like regular invite codes and help you climb the leaderboard faster! 🚀
      </div>
    </div>
  );
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
  const updateProgress = async (amount: number) => {
    const newProgress = progress + amount;
    setProgress(newProgress);
    localStorage.setItem('savings_progress', newProgress.toString());

    // Check for Level 1 reward unlock
    if (newProgress >= 1000 && progress < 1000 && !hasSeinfeldCode) {
      setHasSeinfeldCode(true);
      localStorage.setItem('has_seinfeld_code', 'true');
      
      try {
        // Trigger database reward generation
        const deviceId = getDeviceId();
        const response = await fetch('/api/test/savings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: deviceId, amount: 1000 })
        });
        
        if (response.ok) {
          toast({
            title: "🎉 SURPRISE REWARDS UNLOCKED!",
            description: "Check below for your bonus invite codes! Use them to get extra referral points and hit the leaderboard faster!",
            className: "bg-purple-50 border-purple-200",
            duration: 8000,
          });
        }
      } catch (error) {
        console.error('Error generating reward codes:', error);
      }
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
        Every "Get Deal Now" counts towards money saved + your 1st tier goal
      </div>
      
      <div className="text-xs text-purple-600 mb-2 font-medium">
        ✔️ Secret reward ✔️
      </div>
      
      <button 
        onClick={scrollToLeaderboard}
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        Goal: to hit leaderboard
      </button>

      {/* Always show bonus codes for demonstration */}
      <SavingsRewardCodes />
    </div>
  );
}
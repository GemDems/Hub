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
      
      // Generate Seinfeld code
      const seinfeldCode = `SEIN${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      localStorage.setItem('seinfeld_code', seinfeldCode);
      
      toast({
        title: "🏆 SECRET PRIZE UNLOCKED!",
        description: `Level 1 Seinfeld Code: ${seinfeldCode} (Double referral points!)`,
        className: "bg-purple-50 border-purple-200",
        duration: 8000,
      });
    }
  };

  // Expose updateProgress globally so affiliate cards can use it
  useEffect(() => {
    (window as any).updateSavingsProgress = updateProgress;
  }, [progress, hasSeinfeldCode]);

  return (
    <div className="text-center py-4">
      <div className="flex items-center justify-center space-x-3 mb-2">
        <span className="text-sm text-gray-600">Money Saved:</span>
        <span className="text-lg font-semibold text-green-700">${progress.toLocaleString()}</span>
      </div>
      
      <Progress 
        value={progressPercentage} 
        className="h-2 bg-gray-100 mb-2" 
      />
      
      <div className="text-xs text-gray-500 mb-1">
        👉 Every "Get Deal Now" increases your amount saved
      </div>
      
      <div className="text-xs font-medium text-gray-700">
        Goal: Hit the leaderboard
      </div>

      {hasSeinfeldCode && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <div className="text-xs font-medium text-green-800 mb-1">
            Reward Unlocked!
          </div>
          <div className="text-xs font-mono bg-green-100 rounded px-2 py-1 text-green-700">
            {localStorage.getItem('seinfeld_code')}
          </div>
        </div>
      )}
    </div>
  );
}
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-gray-700">Progress to $1,000</span>
        <span className="text-2xl font-bold text-yellow-600">${progress.toLocaleString()}</span>
      </div>
      
      <div className="relative">
        <Progress 
          value={progressPercentage} 
          className="h-4 bg-gray-200" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 rounded-full pointer-events-none"></div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-600">
        <span>$0</span>
        <span className="font-medium">
          {remainingAmount > 0 
            ? `$${remainingAmount.toLocaleString()} remaining`
            : "Goal achieved! 🎉"
          }
        </span>
        <span>$1,000</span>
      </div>

      {hasSeinfeldCode && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-center mb-2">
            <Gift className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-lg font-bold text-purple-800">Surprise Reward Unlocked!</span>
          </div>
          <div className="text-center">
            <div className="text-sm font-mono bg-purple-100 border border-purple-300 rounded px-3 py-2 inline-block">
              Special Code: {localStorage.getItem('seinfeld_code')}
            </div>
            <div className="text-xs text-purple-600 mt-2">
              🎁 This exclusive code gives double referral points when shared!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
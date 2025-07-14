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
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-bold text-green-800">
          <TrendingUp className="w-5 h-5 mr-2" />
          Your Savings Progress
        </CardTitle>
        <p className="text-sm text-green-700">
          Click "Get Deal Now" on products to track your savings journey
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-700 font-medium">Progress to $1,000</span>
            <span className="text-green-800 font-bold">${progress.toLocaleString()}</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="text-xs text-green-600 text-center">
            {remainingAmount > 0 
              ? `$${remainingAmount.toLocaleString()} remaining to unlock secret reward`
              : "🎉 Goal achieved! Secret reward unlocked!"
            }
          </div>
        </div>

        {hasSeinfeldCode && (
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <Gift className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm font-bold text-purple-800">Level 1 Unlocked!</span>
            </div>
            <div className="text-xs text-purple-700">
              <strong>Seinfeld Code:</strong> {localStorage.getItem('seinfeld_code')}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              💎 This special code gives double referral points when shared!
            </div>
          </div>
        )}

        <div className="bg-white/60 rounded-lg p-3 border border-green-300">
          <div className="flex items-center justify-center space-x-6 text-xs">
            <div className="flex items-center">
              <Zap className="w-3 h-3 mr-1 text-green-600" />
              <span className="text-green-700">Click deals to save</span>
            </div>
            <div className="flex items-center">
              <Gift className="w-3 h-3 mr-1 text-purple-600" />
              <span className="text-green-700">Reach $1K for reward</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
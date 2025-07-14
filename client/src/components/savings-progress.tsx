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
    <Card className="bg-black border border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="flex items-center justify-center text-sm font-bold text-yellow-400">
          <TrendingUp className="w-4 h-4 mr-2" />
          ELITE PROGRESS TRACKER
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">LEVEL 1 TARGET</span>
            <span className="text-yellow-400 font-bold">${progress.toLocaleString()}</span>
          </div>
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-gray-800 border border-yellow-500/30" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-full"></div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            {remainingAmount > 0 
              ? `${remainingAmount.toLocaleString()} TO UNLOCK`
              : "LEVEL 1 ACHIEVED"
            }
          </div>
        </div>

        {hasSeinfeldCode && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
            <div className="flex items-center justify-center mb-1">
              <Gift className="w-3 h-3 text-yellow-500 mr-1" />
              <span className="text-xs font-bold text-yellow-400">LEVEL 1 ACTIVE</span>
            </div>
            <div className="text-xs text-center text-yellow-300">
              CODE: {localStorage.getItem('seinfeld_code')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
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
    <div className="bg-green-800 rounded-lg p-6 text-center">
      <div className="mb-3">
        <h3 className="text-xl font-bold text-white mb-1">MONEY SAVED</h3>
        <div className="text-3xl font-black text-green-300">${progress.toLocaleString()}</div>
      </div>
      
      <div className="bg-green-900/50 rounded p-3 mb-3">
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-green-900" 
        />
        <div className="text-xs text-green-200 mt-1 font-medium">
          REWARD AT $1,000 SAVED
        </div>
      </div>

      <div className="text-xs text-green-200 font-medium">
        Every time you "Get Deal Now" you increase this amount
      </div>

      {hasSeinfeldCode && (
        <div className="mt-4 bg-green-700 border border-green-600 rounded p-3">
          <div className="text-sm font-bold text-green-100 mb-1">
            REWARD UNLOCKED!
          </div>
          <div className="text-xs font-mono bg-green-600 rounded px-2 py-1 text-white">
            {localStorage.getItem('seinfeld_code')}
          </div>
        </div>
      )}
    </div>
  );
}
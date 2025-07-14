import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Users, Gift, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Generate persistent device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('elite_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('elite_device_id', deviceId);
  }
  return deviceId;
};

export default function ReferralSystem() {
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const deviceId = getDeviceId();

  // Get or generate user referral status
  const { data: referralStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/referral/status", deviceId],
    queryFn: () => fetch(`/api/referral/status?userId=${deviceId}`).then(res => res.json())
  });

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/referral/generate", { userId: deviceId });
      return response.json();
    },
    onSuccess: () => {
      refetchStatus();
      toast({
        title: "Success!",
        description: "Your exclusive referral code has been generated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate referral code.",
        variant: "destructive",
      });
    }
  });

  // Use referral code mutation
  const useCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/referral/use", { 
        code: code.toUpperCase(), 
        deviceId 
      });
      return response.json();
    },
    onSuccess: (data) => {
      refetchStatus();
      if (data.vipUnlocked) {
        toast({
          title: "🎉 VIP STATUS UNLOCKED!",
          description: "You're now part of the Elite Club! Check the leaderboard.",
          className: "bg-yellow-50 border-yellow-200",
        });
      } else {
        toast({
          title: "Code Applied!",
          description: `Code used successfully. ${3 - data.usedCount} more uses needed for VIP.`,
        });
      }
      setInputCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Invalid Code",
        description: error.message || "This code is invalid or already used on this device.",
        variant: "destructive",
      });
    }
  });

  const handleCopyCode = () => {
    if (referralStatus?.myCode) {
      navigator.clipboard.writeText(referralStatus.myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Share this code to get VIP access.",
      });
    }
  };

  const handleUseCode = () => {
    if (inputCode.trim()) {
      useCodeMutation.mutate(inputCode.trim());
    }
  };

  const handleGenerateCode = () => {
    generateCodeMutation.mutate();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center text-lg font-bold text-gray-800">
          <Crown className={`w-5 h-5 mr-2 ${referralStatus?.isVip ? 'text-yellow-500' : 'text-gray-400'}`} />
          {referralStatus?.isVip ? 'VIP MEMBER' : 'Join Elite Club'}
        </CardTitle>
        {referralStatus?.isVip && (
          <p className="text-xs text-yellow-600 font-medium">
            ✨ Elite status active • Leaderboard eligible
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* My Referral Code Section */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            My Invite Code
          </label>
          {referralStatus?.myCode ? (
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 font-mono text-sm font-bold text-center">
                {referralStatus.myCode}
              </div>
              <Button
                onClick={handleCopyCode}
                size="sm"
                variant="outline"
                className="px-3"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleGenerateCode}
              disabled={generateCodeMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {generateCodeMutation.isPending ? "Generating..." : "Get My Code"}
            </Button>
          )}
          {referralStatus?.myCode && (
            <p className="text-xs text-gray-500">
              Uses: {referralStatus.usedCount}/3 for VIP
            </p>
          )}
        </div>

        {/* Use Code Section */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Use Invite Code
          </label>
          <div className="flex items-center space-x-2">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="flex-1 text-center font-mono text-sm"
              maxLength={10}
            />
            <Button
              onClick={handleUseCode}
              disabled={!inputCode.trim() || useCodeMutation.isPending}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white px-4"
            >
              {useCodeMutation.isPending ? "..." : "Apply"}
            </Button>
          </div>
        </div>

        {/* Status Info */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1 text-blue-500" />
              <span className="text-gray-600">Invite 3 friends</span>
            </div>
            <div className="flex items-center">
              <Gift className="w-3 h-3 mr-1 text-purple-500" />
              <span className="text-gray-600">Get VIP access</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
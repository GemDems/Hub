import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Gift, Users, Crown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ReferralSystem() {
  const [referralCode, setReferralCode] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/referral/generate");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `Your referral code: ${data.code}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referral/status"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate referral code",
        variant: "destructive",
      });
    },
  });

  // Use referral code mutation
  const useCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/referral/use", { code });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.vipUnlocked) {
        toast({
          title: "VIP Status Unlocked!",
          description: "Congratulations! You've been promoted to VIP status!",
        });
      } else {
        toast({
          title: "Code Used!",
          description: `Code used successfully. ${3 - data.usedCount} more uses needed for VIP.`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/referral/status"] });
      setReferralCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Invalid or already used code",
        variant: "destructive",
      });
    },
  });

  // Get user referral status
  const { data: referralStatus } = useQuery({
    queryKey: ["/api/referral/status"],
    retry: false,
  });

  const handleUseCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (referralCode.trim()) {
      useCodeMutation.mutate(referralCode.trim());
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-md mx-auto">
      {/* VIP Status Display */}
      {referralStatus?.isVip && (
        <Card className="p-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span className="font-bold">VIP Member</span>
          </div>
        </Card>
      )}

      {/* Generate Referral Code */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-conversion-blue" />
            <h3 className="font-semibold">Elite Club Invite</h3>
          </div>
          <p className="text-sm text-gray-600">
            Generate your referral code and invite 3 friends to unlock VIP status!
          </p>
          <Button 
            onClick={() => generateCodeMutation.mutate()}
            disabled={generateCodeMutation.isPending}
            className="w-full bg-conversion-blue hover:bg-conversion-blue/90"
          >
            {generateCodeMutation.isPending ? "Generating..." : "Generate My Code"}
          </Button>
          
          {referralStatus?.myCode && (
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium">Your Code:</p>
              <p className="text-lg font-bold text-conversion-blue">{referralStatus.myCode}</p>
              <p className="text-xs text-gray-600">
                Used: {referralStatus.usedCount}/3 times
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Use Referral Code */}
      <Card className="p-4">
        <form onSubmit={handleUseCode} className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-conversion-blue" />
            <h3 className="font-semibold">Have a Code?</h3>
          </div>
          <div>
            <Label htmlFor="referral-code">Enter Referral Code</Label>
            <Input
              id="referral-code"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              placeholder="ENTER-CODE-HERE"
              className="mt-1"
            />
          </div>
          <Button 
            type="submit" 
            disabled={useCodeMutation.isPending || !referralCode.trim()}
            className="w-full"
          >
            {useCodeMutation.isPending ? "Using Code..." : "Use Code"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
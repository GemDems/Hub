import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function IdeaSubmission() {
  const [idea, setIdea] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [clickOverlays, setClickOverlays] = useState<Array<{id: string, x: number, y: number, color: string}>>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user has already submitted an idea
  useEffect(() => {
    const deviceId = localStorage.getItem("deviceId") || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    if (!localStorage.getItem("deviceId")) {
      localStorage.setItem("deviceId", deviceId);
    }

    const submittedIdea = localStorage.getItem(`idea_submitted_${deviceId}`);
    if (submittedIdea) {
      setHasSubmitted(true);
    }

    // Fade in animation after component mounts
    setTimeout(() => setIsVisible(true), 500);
  }, []);

  const submitIdeaMutation = useMutation({
    mutationFn: async (ideaText: string) => {
      const deviceId = localStorage.getItem("deviceId");
      return await apiRequest("POST", "/api/user-ideas", {
        idea: ideaText,
        deviceId: deviceId
      });
    },
    onSuccess: () => {
      const deviceId = localStorage.getItem("deviceId");
      localStorage.setItem(`idea_submitted_${deviceId}`, idea);
      setHasSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-ideas"] });
      toast({
        title: "Idea Submitted!",
        description: "Your product idea has been sent to our team.",
      });
      setIdea("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit idea. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idea.trim()) {
      toast({
        title: "Empty Idea",
        description: "Please enter your product idea.",
        variant: "destructive",
      });
      return;
    }

    const words = idea.trim().split(/\s+/);
    if (words.length > 2) {
      toast({
        title: "Too Many Words",
        description: "Please keep your idea to 2 words maximum.",
        variant: "destructive",
      });
      return;
    }

    if (idea.length > 20) {
      toast({
        title: "Too Long",
        description: "Please keep your idea under 20 characters.",
        variant: "destructive",
      });
      return;
    }

    submitIdeaMutation.mutate(idea.trim());
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger on form elements
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON' || target.closest('form')) {
      return;
    }
    
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newOverlay = {
      id: Date.now().toString(),
      x,
      y,
      color: randomColor
    };
    
    setClickOverlays(prev => [...prev, newOverlay]);
    
    // Remove overlay after animation
    setTimeout(() => {
      setClickOverlays(prev => prev.filter(overlay => overlay.id !== newOverlay.id));
    }, 1000);
  };

  if (hasSubmitted) {
    return (
      <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <p className="text-green-600 dark:text-green-400 font-medium">
            ✅ Thank you! Your idea has been submitted to our team.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            One idea per device - yours has been received!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div 
        className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 relative overflow-hidden cursor-pointer"
        onClick={handleClick}
      >
        {/* Colorful click overlays */}
        {clickOverlays.map(overlay => (
          <div
            key={overlay.id}
            className="absolute pointer-events-none animate-bounce"
            style={{
              left: overlay.x - 10,
              top: overlay.y - 10,
              animation: 'colorful-bounce 1s ease-out forwards'
            }}
          >
            <div 
              className="w-5 h-5 rounded-full"
              style={{ 
                backgroundColor: overlay.color,
                boxShadow: `0 0 20px ${overlay.color}`,
                animation: 'pulse 1s ease-out forwards'
              }}
            />
          </div>
        ))}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            💡 Got a Product Idea?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Share your 2-word product idea with our team
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Smart Watch, Eco Bottle, etc."
              maxLength={20}
              className="text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-500/30 focus:border-purple-500 transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
              {idea.length}/20
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={submitIdeaMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {submitIdeaMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit Idea ✨"
            )}
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-3">
          One idea per device • 2 words max • 20 characters limit
        </p>
      </div>
    </div>
  );
}
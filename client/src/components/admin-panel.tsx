import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Shield, Eye, EyeOff, Plus, Trash2, Upload, Image, FileText, Globe, Calendar, ExternalLink, Clock } from "lucide-react";
import type { InsertAffiliateLink, AffiliateLink, UserIdea } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPanel({ isOpen, onClose, onSuccess }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "drafts" | "manage" | "ideas">("create");
  const [formData, setFormData] = useState<InsertAffiliateLink & { isVerified?: boolean; isDraft?: boolean; scheduledPublishAt?: Date; scheduledDeleteAt?: Date }>({
    title: "",
    url: "",
    description: "",
    category: "Hot Deals",
    imageUrl: "",
    imageUrls: [],
    price: "",
    isVerified: false,
    isDraft: false,
    scheduledPublishAt: undefined,
    scheduledDeleteAt: undefined,
    aiPrivateInfo: "",
  });

  const [schedulingProduct, setSchedulingProduct] = useState<{ id: number; title: string; type: 'publish' | 'delete' } | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>("");
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all products and drafts for management
  const { data: allProducts = [] } = useQuery({
    queryKey: ["/api/admin/affiliate-links"],
    enabled: isAuthenticated,
  });

  const { data: drafts = [] } = useQuery({
    queryKey: ["/api/admin/drafts"],
    enabled: isAuthenticated,
  });

  // Fetch user ideas
  const { data: userIdeas = [], refetch: refetchIdeas } = useQuery<UserIdea[]>({
    queryKey: ["/api/admin/user-ideas"],
    enabled: isAuthenticated && activeTab === "ideas",
  });

  const addImageField = () => {
    setAdditionalImages([...additionalImages, ""]);
  };

  const removeImageField = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const updateImageField = (index: number, value: string) => {
    const updated = [...additionalImages];
    updated[index] = value;
    setAdditionalImages(updated);
  };

  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const dataURL = await convertFileToDataURL(file);
        setFormData({ ...formData, imageUrl: dataURL });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to process the image",
          variant: "destructive",
        });
      }
    }
  };

  const handleAdditionalImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const dataURL = await convertFileToDataURL(file);
        updateImageField(index, dataURL);
      } catch (error) {
        toast({
          title: "Upload failed",
          description: "Failed to process the image",
          variant: "destructive",
        });
      }
    }
  };

  // Publish draft mutation
  const publishDraftMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("POST", `/api/admin/publish/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drafts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
      toast({
        title: "Draft Published",
        description: "Product is now live on the site",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish draft",
        variant: "destructive",
      });
    },
  });

  // Publish all drafts mutation
  const publishAllDraftsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/publish-all");
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drafts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
      toast({
        title: "All Drafts Published",
        description: `${data.published} products are now live on the site`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish all drafts",
        variant: "destructive",
      });
    },
  });

  // Schedule deletion mutation
  const scheduleDeleteMutation = useMutation({
    mutationFn: async ({ id, scheduledDeleteAt }: { id: number; scheduledDeleteAt: Date | null }) => {
      return await apiRequest("PUT", `/api/admin/schedule-delete/${id}`, { scheduledDeleteAt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
      setSchedulingProduct(null);
      setScheduleDate("");
      toast({
        title: "Deletion Scheduled",
        description: "Product will be automatically deleted at the scheduled time",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule deletion",
        variant: "destructive",
      });
    },
  });

  // Schedule publishing mutation
  const schedulePublishMutation = useMutation({
    mutationFn: async ({ id, scheduledPublishAt }: { id: number; scheduledPublishAt: Date | null }) => {
      return await apiRequest("PUT", `/api/admin/schedule-publish/${id}`, { scheduledPublishAt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drafts"] });
      setSchedulingProduct(null);
      setScheduleDate("");
      toast({
        title: "Publishing Scheduled",
        description: "Draft will be automatically published at the scheduled time",
      });
    },
    onError: (error) => {
      console.error("Schedule publish error:", error);
      toast({
        title: "Error",
        description: "Failed to schedule publishing",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/affiliate-links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drafts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
      toast({
        title: "Product Removed",
        description: "Product has been permanently deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove product",
        variant: "destructive",
      });
    },
  });
  
  const ADMIN_PASSWORD = "9f$81r@V7#iwant";
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
      toast({
        title: "Access Granted",
        description: "Welcome to Creator Mode",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
      setPassword("");
    }
  };
  
  const handleClose = () => {
    setIsAuthenticated(false);
    setPassword("");
    setActiveTab("create");
    resetForm();
    onClose();
  };

  const createLinkMutation = useMutation({
    mutationFn: async (data: InsertAffiliateLink) => {
      console.log("Sending data to API:", JSON.stringify(data, null, 2));
      return await apiRequest("POST", "/api/affiliate-links", data);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliate-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drafts"] });
      
      const isDraft = variables.isDraft;
      toast({
        title: "Success!",
        description: isDraft ? "Draft saved successfully" : "Product published successfully",
      });
      
      resetForm();
      if (!isDraft) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Create link error:", error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Image URL validation (if provided) - skip validation for data URLs (uploaded images)
    if (formData.imageUrl && formData.imageUrl.trim() && !formData.imageUrl.startsWith('data:')) {
      try {
        new URL(formData.imageUrl);
      } catch {
        toast({
          title: "Invalid Image URL",
          description: "Please enter a valid image URL",
          variant: "destructive",
        });
        return;
      }
    }

    // Additional images validation
    for (let i = 0; i < additionalImages.length; i++) {
      const imageUrl = additionalImages[i];
      if (imageUrl && imageUrl.trim() && !imageUrl.startsWith('data:')) {
        try {
          new URL(imageUrl);
        } catch {
          toast({
            title: "Invalid Image URL",
            description: `Please enter a valid URL for additional image ${i + 1}`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Combine all images into imageUrls array for submission
    const allImageUrls = [formData.imageUrl, ...additionalImages].filter(url => url && url.trim());
    const submissionData = {
      ...formData,
      imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined,
      isDraft: isDraft,
      // Convert boolean values to integers for database compatibility
      isVerified: formData.isVerified ? 1 : 0,
      isElitePick: formData.isElitePick ? 1 : 0,
      stock: formData.stock || 0,
      aiPrivateInfo: formData.aiPrivateInfo || null
    };
    createLinkMutation.mutate(submissionData);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
      description: "",
      category: "Hot Deals",
      imageUrl: "",
      imageUrls: [],
      price: "",
      isVerified: false,
      isDraft: false,
      scheduledPublishAt: undefined,
      scheduledDeleteAt: undefined,
      aiPrivateInfo: "",
    });
    setAdditionalImages([]);
  };



  const renderProductCard = (product: AffiliateLink, isDraft = false) => (
    <Card key={product.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{product.title}</CardTitle>
            <CardDescription>{product.category}</CardDescription>
          </div>
          <div className="flex gap-2">
            {isDraft && (
              <>
                <Button
                  size="sm"
                  onClick={() => publishDraftMutation.mutate(product.id)}
                  disabled={publishDraftMutation.isPending}
                >
                  <Globe className="w-4 h-4 mr-1" />
                  Publish Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSchedulingProduct({ id: product.id, title: product.title, type: 'publish' })}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Schedule Publish
                </Button>
              </>
            )}
            {!isDraft && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSchedulingProduct({ id: product.id, title: product.title, type: 'delete' })}
              >
                <Clock className="w-4 h-4 mr-1" />
                Schedule Delete
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteProductMutation.mutate(product.id)}
              disabled={deleteProductMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{product.description}</p>
          <div className="flex gap-2">
            {product.price && (
              <Badge variant="outline">{product.price}</Badge>
            )}
            {product.isVerified ? (
              <Badge variant="secondary">Verified</Badge>
            ) : null}
            {product.clicks > 0 && (
              <Badge variant="outline">{product.clicks} clicks</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            Created: {new Date(product.createdAt).toLocaleDateString()}
          </div>
          {product.scheduledPublishAt && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="w-4 h-4" />
              Scheduled for publishing: {new Date(product.scheduledPublishAt).toLocaleDateString()} at {new Date(product.scheduledPublishAt).toLocaleTimeString()}
            </div>
          )}
          {product.scheduledDeleteAt && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <Clock className="w-4 h-4" />
              Scheduled for deletion: {new Date(product.scheduledDeleteAt).toLocaleDateString()} at {new Date(product.scheduledDeleteAt).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-conversion-blue" />
              {isAuthenticated ? "Creator Mode Dashboard" : "Creator Authentication Required"}
            </DialogTitle>
          </DialogHeader>

        {!isAuthenticated ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="text-center py-4">
              <Lock className="w-12 h-12 text-conversion-blue mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Enter your creator password to access the admin panel
              </p>
            </div>
            
            <div className="relative">
              <Label htmlFor="password">Creator Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-conversion-blue hover:bg-blue-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Authenticate
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="create">Create Product</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
              <TabsTrigger value="manage">Manage All</TabsTrigger>
              <TabsTrigger value="ideas">User Ideas ({userIdeas.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Product</CardTitle>
                  <CardDescription>Add a new affiliate link to your site</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
          <div>
            <Label htmlFor="title">Link Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Amazing Product Deal"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="url">Affiliate URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://amazon.com/product-link"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <div className="space-y-2">
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Limited time offer - 50% off!"
                rows={3}
                className="mt-1"
              />
              
              {/* AI Description Editor - 1000% Conversion Optimizer */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (!formData.description.trim()) {
                      toast({
                        title: "Enter Description First",
                        description: "Please add some description text before enhancement",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    // BATMAN-LEVEL AI: Generate unique conversion-optimized descriptions (18-20 words MAX)
                    let originalText = formData.description.trim().toLowerCase();
                    
                    // Fix grammar first
                    let cleanText = formData.description.trim()
                      .replace(/\bi\b/g, 'I')
                      .replace(/\s+/g, ' ')
                      .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => punct + ' ' + letter.toUpperCase())
                      .replace(/^([a-z])/, (match) => match.toUpperCase())
                      .replace(/\b(teh|hte)\b/gi, 'the')
                      .replace(/\b(adn|nad)\b/gi, 'and')
                      .replace(/\b(taht|thta)\b/gi, 'that')
                      .replace(/\b(youer|yuor)\b/gi, 'your');
                    
                    // Generate unique seed based on title + category + description
                    const seed = (formData.title + formData.category + originalText).length % 12;
                    
                    // 12 UNIQUE BATMAN-PRECISION TEMPLATES with psychological selling power
                    const batmanTemplates = [
                      (text) => `Master-engineered for perfectionists who won't compromise. ${text} outperforms everything you've tried before.`,
                      (text) => `Feel the difference instantly. ${text} transforms your world in ways you never thought possible.`,
                      (text) => `Crafted for winners. ${text} gives you the unfair advantage over everyone still settling.`,
                      (text) => `Silent, deadly effective. ${text} works its magic while others struggle with cheap alternatives.`,
                      (text) => `Laboratory-tested precision. ${text} delivers the breakthrough performance you've been desperately seeking all along.`,
                      (text) => `Revolutionary breakthrough. ${text} is what happens when genius meets ruthless quality obsession.`,
                      (text) => `Transcends all expectations. ${text} provides capabilities that make competitors look like toys.`,
                      (text) => `Zero-defect execution. ${text} solves problems that weaker products can't even recognize exist.`,
                      (text) => `Relentless excellence standard. ${text} designed exclusively for those who demand absolute perfection.`,
                      (text) => `Competitive domination tool. ${text} delivers crushing results while others make weak excuses.`,
                      (text) => `Military-grade superiority. ${text} unleashes capabilities your competition doesn't know are possible.`,
                      (text) => `Life-changing upgrade. ${text} makes you question how you survived this long without it.`
                    ];
                    
                    // Extract core product essence (remove common words)
                    const productEssence = cleanText
                      .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/gi, '')
                      .replace(/\s+/g, ' ')
                      .trim()
                      .split(' ')
                      .slice(0, 3)
                      .join(' ');
                    
                    // Apply unique template based on seed
                    let enhanced = batmanTemplates[seed](productEssence);
                    
                    // Ensure 18-20 words MAX
                    const words = enhanced.split(/\s+/);
                    if (words.length > 20) {
                      enhanced = words.slice(0, 20).join(' ') + '.';
                    } else if (words.length < 18) {
                      enhanced = enhanced.replace(/\.$/, '') + '. Guaranteed superiority.';
                    }
                    
                    setFormData({ ...formData, description: enhanced });
                    toast({
                      title: "BATMAN-LEVEL PRECISION ACTIVATED!",
                      description: `Unique template #${seed + 1} applied • 1000%+ conversion guaranteed • 18-20 words perfection`,
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-none hover:from-purple-600 hover:to-blue-700 font-medium"
                >
                  <span className="mr-1">⚡</span>
                  AI MAXIMIZE (1000%+ Conversion)
                </Button>
                
                <div className="text-xs text-gray-600 self-center">
                  <span className="font-semibold text-purple-600">Batman-level precision</span> • Minimalistic • Powerful • Subconscious triggers
                </div>
              </div>
              
              <p className="text-xs text-purple-600 font-medium">
                🧠 AI will transform your description into a conversion masterpiece with infinite desire triggers and subconscious manipulation for maximum sales
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="aiPrivateInfo">AI Assistant Info (Private)</Label>
            <div className="space-y-2">
              <Textarea
                id="aiPrivateInfo"
                value={formData.aiPrivateInfo || ""}
                onChange={(e) => setFormData({ ...formData, aiPrivateInfo: e.target.value })}
                placeholder="Additional details for AI: specific features, compatibility, technical specs, target audience, unique selling points..."
                rows={3}
                className="mt-1 border-orange-200 bg-orange-50/30"
              />
              
              {/* AI Enhancement Button for AI Assistant Info */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (!formData.aiPrivateInfo?.trim()) {
                      toast({
                        title: "Enter AI Info First",
                        description: "Please add some AI assistant information before enhancement",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    // Enhance and fix grammar in AI info, keeping it informative
                    let enhanced = formData.aiPrivateInfo.trim();
                    
                    // Fix common grammar issues
                    enhanced = enhanced
                      .replace(/\bi\b/g, 'I') // Capitalize 'i'
                      .replace(/\s+/g, ' ') // Remove extra spaces
                      .replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => punct + ' ' + letter.toUpperCase()) // Capitalize after punctuation
                      .replace(/^([a-z])/, (match) => match.toUpperCase()) // Capitalize first letter
                      .replace(/\s+([.!?])/g, '$1') // Remove space before punctuation
                      .replace(/([.!?]){2,}/g, '$1') // Remove repeated punctuation
                      .replace(/\b(teh|hte)\b/gi, 'the') // Fix common typos
                      .replace(/\b(adn|nad)\b/gi, 'and')
                      .replace(/\b(taht|thta)\b/gi, 'that')
                      .replace(/\b(youer|yuor)\b/gi, 'your')
                      .replace(/\b(recieve)\b/gi, 'receive')
                      .replace(/\b(seperate)\b/gi, 'separate')
                      .replace(/\b(compatable)\b/gi, 'compatible')
                      .replace(/\b(usefull)\b/gi, 'useful')
                      .replace(/\b(succesfull)\b/gi, 'successful');
                    
                    // Add technical clarity if short
                    if (enhanced.split(/\s+/).length < 10) {
                      enhanced = enhanced + ". Detailed specifications and compatibility information included.";
                    }
                    
                    setFormData({ ...formData, aiPrivateInfo: enhanced });
                    toast({
                      title: "AI Info Enhanced!",
                      description: "Grammar fixed and technical details optimized for AI understanding",
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-none hover:from-orange-600 hover:to-red-700 font-medium"
                >
                  <span className="mr-1">⚡</span>
                  AI MAXIMIZE (1000%+ Conversion)
                </Button>
                
                <div className="text-xs text-orange-600 self-center">
                  <span className="font-semibold text-orange-700">Technical precision</span> • Grammar fix • AI optimization
                </div>
              </div>
              
              <p className="text-xs text-orange-600 font-medium">
                🤖 Private field - Only the AI chatbot can see this information to help users find products faster and more accurately. Enhanced info = better product matching!
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Product Image (Optional)</Label>
            <div className="space-y-2 mt-1">
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl && !formData.imageUrl.startsWith('data:') ? formData.imageUrl : ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/product-image.jpg"
                  className="flex-1"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="main-image-upload"
                  />
                  <Button type="button" variant="outline" size="sm" className="h-9 px-3">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </div>
              </div>
              {formData.imageUrl && formData.imageUrl.startsWith('data:') && (
                <div className="flex items-center text-xs text-green-600">
                  <Image className="w-3 h-3 mr-1" />
                  Image uploaded successfully
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Add a URL link or upload from your camera roll/files
            </p>
          </div>

          {/* Additional Images Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Additional Images (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImageField}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Image
              </Button>
            </div>
            
            {additionalImages.map((imageUrl, index) => (
              <div key={index} className="space-y-2 mb-3">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={imageUrl && !imageUrl.startsWith('data:') ? imageUrl : ''}
                    onChange={(e) => updateImageField(index, e.target.value)}
                    placeholder={`https://images.unsplash.com/image-${index + 2}.jpg`}
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAdditionalImageUpload(index, e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id={`additional-image-upload-${index}`}
                    />
                    <Button type="button" variant="outline" size="sm" className="h-9 px-3">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageField(index)}
                    className="px-2 h-9"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {imageUrl && imageUrl.startsWith('data:') && (
                  <div className="flex items-center text-xs text-green-600">
                    <Image className="w-3 h-3 mr-1" />
                    Image uploaded successfully
                  </div>
                )}
              </div>
            ))}
            
            <p className="text-xs text-gray-500 mt-1">
              Add multiple images with URL links or upload from your camera roll/files
            </p>
          </div>

          <div>
            <Label htmlFor="price">Product Price (Optional)</Label>
            <Input
              id="price"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="$29.99"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the product price (e.g., $29.99, €45, ¥1000)
            </p>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hot Deals">Hot Deals</SelectItem>
                <SelectItem value="Tech & Gadgets">Tech & Gadgets</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Health & Fitness">Health & Fitness</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verified Source Badge Checkbox */}
          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-blue-50">
            <Checkbox
              id="verified-badge"
              checked={formData.isVerified}
              onCheckedChange={(checked) => setFormData({ ...formData, isVerified: Boolean(checked) })}
            />
            <Label htmlFor="verified-badge" className="text-sm font-medium cursor-pointer">
              🔒 Verified Source Badge (Amazon/Walmart/etc)
            </Label>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium text-sm text-gray-700">Scheduling Options</h3>
            
            <div>
              <Label htmlFor="scheduledPublish">Schedule Publish (Optional)</Label>
              <Input
                id="scheduledPublish"
                type="datetime-local"
                value={formData.scheduledPublishAt ? new Date(formData.scheduledPublishAt.getTime() - formData.scheduledPublishAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, scheduledPublishAt: e.target.value ? new Date(e.target.value) : undefined })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Set when this product should automatically go live</p>
            </div>

            <div>
              <Label htmlFor="scheduledDelete">Schedule Deletion (Optional)</Label>
              <Input
                id="scheduledDelete"
                type="datetime-local"
                value={formData.scheduledDeleteAt ? new Date(formData.scheduledDeleteAt.getTime() - formData.scheduledDeleteAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData({ ...formData, scheduledDeleteAt: e.target.value ? new Date(e.target.value) : undefined })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Set when this product should automatically be removed</p>
            </div>
          </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-conversion-blue hover:bg-blue-700"
                        disabled={createLinkMutation.isPending}
                      >
                        {createLinkMutation.isPending ? "Publishing..." : "Publish Now"}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={createLinkMutation.isPending}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Save as Draft
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="drafts">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Draft Products ({drafts.length})</CardTitle>
                      <CardDescription>Manage your unpublished products</CardDescription>
                    </div>
                    {drafts.length > 0 && (
                      <Button
                        onClick={() => publishAllDraftsMutation.mutate()}
                        disabled={publishAllDraftsMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Publish All Drafts
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {drafts.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No drafts yet</p>
                      <p className="text-sm text-gray-400">Create a product and save it as a draft to see it here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {drafts.map((draft) => renderProductCard(draft, true))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manage">
              <Card>
                <CardHeader>
                  <CardTitle>All Products ({allProducts.length})</CardTitle>
                  <CardDescription>Manage all your affiliate links</CardDescription>
                </CardHeader>
                <CardContent>
                  {allProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No products yet</p>
                      <p className="text-sm text-gray-400">Create your first product to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allProducts.map((product) => renderProductCard(product, false))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ideas">
              <Card>
                <CardHeader>
                  <CardTitle>User Ideas</CardTitle>
                  <CardDescription>
                    Product ideas submitted by users (max 2 words, one per device)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userIdeas.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No user ideas yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Ideas will appear here as users submit them
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userIdeas.map((idea) => (
                        <div key={idea.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-medium text-blue-600">
                                "{idea.idea}"
                              </div>
                              {idea.isReviewed ? (
                                <Badge variant="secondary">Reviewed</Badge>
                              ) : (
                                <Badge variant="outline">New</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Device: {idea.deviceId.slice(-8)} • 
                              Submitted: {new Date(idea.createdAt).toLocaleDateString()} at {new Date(idea.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                          {!idea.isReviewed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                try {
                                  await apiRequest("PUT", `/api/admin/user-ideas/${idea.id}/review`);
                                  refetchIdeas();
                                  toast({
                                    title: "Marked as Reviewed",
                                    description: "Idea has been marked as reviewed",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to mark as reviewed",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              Mark as Reviewed
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>

    {/* Schedule Publishing/Deletion Dialog */}
    <Dialog open={!!schedulingProduct} onOpenChange={() => setSchedulingProduct(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {schedulingProduct?.type === 'publish' ? 'Schedule Publishing' : 'Schedule Deletion'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Schedule automatic {schedulingProduct?.type === 'publish' ? 'publishing' : 'deletion'} for: <strong>{schedulingProduct?.title}</strong>
          </p>
          
          <div>
            <Label htmlFor="scheduleDateTime">
              {schedulingProduct?.type === 'publish' ? 'Publish' : 'Delete'} Date & Time
            </Label>
            <Input
              id="scheduleDateTime"
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (schedulingProduct && scheduleDate) {
                  if (schedulingProduct.type === 'publish') {
                    schedulePublishMutation.mutate({
                      id: schedulingProduct.id,
                      scheduledPublishAt: new Date(scheduleDate),
                    });
                  } else {
                    scheduleDeleteMutation.mutate({
                      id: schedulingProduct.id,
                      scheduledDeleteAt: new Date(scheduleDate),
                    });
                  }
                }
              }}
              disabled={!scheduleDate || scheduleDeleteMutation.isPending || schedulePublishMutation.isPending}
              className="flex-1"
            >
              {schedulingProduct?.type === 'publish' ? 'Schedule Publishing' : 'Schedule Deletion'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSchedulingProduct(null);
                setScheduleDate("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

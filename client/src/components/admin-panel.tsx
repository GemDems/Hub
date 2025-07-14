import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Shield, Eye, EyeOff, Plus, Trash2, Upload, Image } from "lucide-react";
import type { InsertAffiliateLink } from "@shared/schema";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPanel({ isOpen, onClose, onSuccess }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<InsertAffiliateLink>({
    title: "",
    url: "",
    description: "",
    category: "Hot Deals",
    imageUrl: "",
    imageUrls: [],
    price: "",
  });
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

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

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
    setFormData({ title: "", url: "", description: "", category: "Hot Deals", imageUrl: "", imageUrls: [], price: "" });
    setAdditionalImages([]);
    onClose();
  };

  const createLinkMutation = useMutation({
    mutationFn: async (data: InsertAffiliateLink) => {
      const response = await apiRequest("POST", "/api/affiliate-links", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate-links"] });
      toast({
        title: "Success!",
        description: "Affiliate link added successfully",
      });
      setFormData({ title: "", url: "", description: "", category: "Hot Deals", imageUrl: "", imageUrls: [], price: "" });
      setAdditionalImages([]);
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add affiliate link",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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
      imageUrls: allImageUrls.length > 0 ? allImageUrls : undefined
    };
    createLinkMutation.mutate(submissionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-conversion-blue" />
            {isAuthenticated ? "Add New Affiliate Link" : "Creator Authentication Required"}
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="https://affiliate-link.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Limited time offer - 50% off!"
              rows={3}
              className="mt-1"
            />
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
                  placeholder="https://example.com/product-image.jpg"
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
                    placeholder={`https://example.com/image-${index + 2}.jpg`}
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

          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-conversion-blue hover:bg-blue-700"
              disabled={createLinkMutation.isPending}
            >
              {createLinkMutation.isPending ? "Adding..." : "Add Link"}
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
        )}
      </DialogContent>
    </Dialog>
  );
}

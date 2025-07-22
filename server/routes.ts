import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAffiliateLinkSchema } from "@shared/schema";
import { z } from "zod";
import { generateAIChatResponse } from "./cohere-service";

// Global live stats that persist across sessions
let liveStats = {
  viewers: Math.floor(Math.random() * 300) + 200,
  hourlyBuyers: Math.floor(Math.random() * 20) + 15,
  lastHourlyReset: Date.now()
};

// Function to check if we need to reset hourly counter
function checkHourlyReset() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  
  if (now - liveStats.lastHourlyReset >= oneHour) {
    liveStats.hourlyBuyers = Math.floor(Math.random() * 20) + 15;
    liveStats.lastHourlyReset = now;
  }
}

// Function to check and process scheduled operations
async function processScheduledOperations() {
  try {
    const now = new Date();
    
    // Check for scheduled publishes
    const allLinks = await storage.getAllAffiliateLinks();
    for (const link of allLinks) {
      // Auto-publish drafts that are scheduled for now
      if (link.isDraft && link.scheduledPublishAt && now >= link.scheduledPublishAt) {
        await storage.publishDraft(link.id);
        console.log(`Auto-published draft: ${link.title}`);
      }
      
      // Auto-delete products scheduled for deletion
      if (link.scheduledDeleteAt && now >= link.scheduledDeleteAt) {
        await storage.deleteAffiliateLink(link.id);
        console.log(`Auto-deleted product: ${link.title}`);
      }
    }
  } catch (error) {
    console.error("Error processing scheduled operations:", error);
  }
}

// Periodically update counters and process scheduled operations
setInterval(() => {
  checkHourlyReset();
  processScheduledOperations();
  
  // Viewers can fluctuate slightly
  liveStats.viewers = Math.max(150, liveStats.viewers + Math.floor(Math.random() * 10) - 3);
  
  // Hourly buyers constantly go up (75% chance every interval)
  if (Math.random() < 0.75) { // 75% chance every interval
    liveStats.hourlyBuyers += Math.floor(Math.random() * 3) + 1; // Add 1-3
  }
}, 3000); // Update every 3 seconds for more frequent increases

export async function registerRoutes(app: Express): Promise<Server> {
  // Get live statistics
  app.get("/api/live-stats", (req, res) => {
    checkHourlyReset();
    res.json({
      viewers: liveStats.viewers,
      hourlyBuyers: liveStats.hourlyBuyers,
      timestamp: Date.now()
    });
  });

  // AI Description Enhancement - 1000%+ Conversion Optimization
  app.post("/api/ai/enhance-description", async (req, res) => {
    console.log('AI Enhancement Route Hit:', req.body);
    try {
      const { description, title, category } = req.body;
      
      if (!description || !description.trim()) {
        return res.status(400).json({ error: "Description is required" });
      }

      // Ultra-advanced prompt for maximum conversion with subconscious manipulation
      const enhancementPrompt = `
You are the world's #1 conversion copywriter with 1000%+ guaranteed results. Transform this product description into a Batman-level precise, minimalistic yet devastatingly powerful sales copy that triggers infinite desire and addiction.

ORIGINAL: "${description}"
PRODUCT: ${title || "Product"}
CATEGORY: ${category || "General"}

TRANSFORMATION RULES:
1. SUBCONSCIOUS TRIGGERS: Embed psychological triggers that bypass conscious resistance
2. MINIMALISTIC POWER: Short, clear, simple sentences with maximum impact
3. INFINITE DESIRE: Create uncontrollable want and need
4. SILENT MANIPULATION: Influence without being obvious
5. BATMAN PRECISION: Dark, mysterious, powerful - every word chosen deliberately
6. CONVERSION ADDICTION: Make readers unable to resist purchasing
7. SCARCITY PSYCHOLOGY: Subtle urgency without being pushy
8. TRUST ANCHORING: Build instant credibility and desire

CONSTRAINTS:
- Maximum 2-3 sentences
- No obvious sales language
- Pure psychological mastery
- Guarantee 1000%+ conversion improvement
- Create buying compulsion
- Simple language but devastatingly effective

Transform now with maximum conversion power:`;

      const response = await generateAIChatResponse(enhancementPrompt, [], []);
      
      // Extract the enhanced description from AI response
      let enhancedDescription = response.response;
      
      // Clean up the response to get just the enhanced description
      if (enhancedDescription.includes('Transform now with maximum conversion power:')) {
        enhancedDescription = enhancedDescription.split('Transform now with maximum conversion power:')[1]?.trim();
      }
      
      // Remove any remaining formatting or system text
      enhancedDescription = enhancedDescription
        .replace(/^['"]+|['"]+$/g, '') // Remove quotes
        .replace(/^Enhanced Description:|^ENHANCED:|^TRANSFORMED:/gi, '') // Remove prefixes
        .trim();
      
      res.json({ 
        enhancedDescription: enhancedDescription || "Transform your product appeal with precision-crafted messaging that speaks directly to buyer psychology.",
        conversionBoost: "1000%+",
        techniques: ["Subconscious triggers", "Batman precision", "Infinite desire", "Silent manipulation"]
      });
      
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      
      // Fallback enhancement system with Batman-level precision
      const fallbackEnhancements = {
        "electronics": "Precision-engineered technology that transforms your daily experience. This isn't just another gadget—it's your upgrade to effortless excellence.",
        "home": "Crafted for those who recognize quality. Every detail designed to elevate your space into something extraordinary.",
        "fitness": "Built for results, not promises. Your commitment meets our precision—together, they create unstoppable momentum.",
        "beauty": "Pure transformation in every application. The difference is immediate, the confidence is permanent.",
        "books": "Knowledge that changes how you see everything. Once you understand this, you can't unsee the advantage it gives you.",
        "default": "The kind of quality that speaks for itself. Simple, powerful, undeniable—exactly what you've been looking for."
      };
      
      const categoryKey = category?.toLowerCase().includes('electronic') ? 'electronics' :
                         category?.toLowerCase().includes('home') ? 'home' :
                         category?.toLowerCase().includes('fitness') ? 'fitness' :
                         category?.toLowerCase().includes('beauty') ? 'beauty' :
                         category?.toLowerCase().includes('book') ? 'books' : 'default';
      
      const fallbackDescription = fallbackEnhancements[categoryKey];
      
      res.json({ 
        enhancedDescription: fallbackDescription,
        conversionBoost: "1000%+",
        techniques: ["Subconscious triggers", "Batman precision", "Infinite desire", "Fallback optimization"],
        fallback: true
      });
    }
  });

  // Get published affiliate links (public)
  app.get("/api/affiliate-links", async (req, res) => {
    try {
      const links = await storage.getPublishedAffiliateLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch affiliate links" });
    }
  });

  // Admin routes for Creator Mode
  app.get("/api/admin/affiliate-links", async (req, res) => {
    try {
      const links = await storage.getAllAffiliateLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all affiliate links" });
    }
  });

  app.get("/api/admin/drafts", async (req, res) => {
    try {
      const drafts = await storage.getDraftAffiliateLinks();
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drafts" });
    }
  });

  app.post("/api/admin/publish/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const published = await storage.publishDraft(id);
      if (published) {
        res.json(published);
      } else {
        res.status(404).json({ message: "Draft not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to publish draft" });
    }
  });

  app.post("/api/admin/publish-all", async (req, res) => {
    try {
      const published = await storage.publishAllDrafts();
      res.json({ published: published.length, products: published });
    } catch (error) {
      res.status(500).json({ message: "Failed to publish all drafts" });
    }
  });

  app.put("/api/admin/schedule-delete/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { scheduledDeleteAt } = req.body;
      
      const updated = await storage.updateAffiliateLink(id, { 
        scheduledDeleteAt: scheduledDeleteAt ? new Date(scheduledDeleteAt) : null 
      });
      
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to schedule deletion" });
    }
  });

  // Schedule draft publishing
  app.put("/api/admin/schedule-publish/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { scheduledPublishAt } = req.body;
      
      const updated = await storage.updateAffiliateLink(id, { 
        scheduledPublishAt: scheduledPublishAt ? new Date(scheduledPublishAt) : null 
      });
      
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ message: "Draft not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to schedule publishing" });
    }
  });

  // DELETE route for removing products
  app.delete("/api/admin/affiliate-links/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAffiliateLink(id);
      if (deleted) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("Error deleting affiliate link:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Create new affiliate link
  app.post("/api/affiliate-links", async (req, res) => {
    try {
      console.log("Received data:", JSON.stringify(req.body, null, 2));
      
      // Manual validation and conversion
      const { title, url, description, category } = req.body;
      
      if (!title || !url || !description || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const linkData = {
        title: String(title),
        url: String(url),
        description: String(description),
        category: String(category),
        imageUrl: req.body.imageUrl || null,
        imageUrls: req.body.imageUrls || null,
        price: req.body.price || null,
        stock: Number(req.body.stock) || 0,
        isElitePick: req.body.isElitePick ? 1 : 0,
        isVerified: req.body.isVerified ? 1 : 0,
        isDraft: req.body.isDraft ? 1 : 0,
        scheduledPublishAt: req.body.scheduledPublishAt || null,
        scheduledDeleteAt: req.body.scheduledDeleteAt || null,
      };
      
      console.log("Processed data:", JSON.stringify(linkData, null, 2));
      const newLink = await storage.createAffiliateLink(linkData);
      res.status(201).json(newLink);
    } catch (error) {
      console.error("Error creating affiliate link:", error);
      res.status(500).json({ message: "Failed to create affiliate link" });
    }
  });

  // Track link click and redirect
  app.post("/api/affiliate-links/:id/click", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const link = await storage.incrementLinkClicks(id);
      
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }

      res.json({ url: link.url, clicks: link.clicks });
    } catch (error) {
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Delete affiliate link with password protection
  app.delete("/api/affiliate-links/:id", async (req, res) => {
    try {
      const { password } = req.body;
      const ADMIN_PASSWORD = "9f$81r@V7#iwant";
      
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAffiliateLink(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Link not found" });
      }

      res.json({ message: "Link deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete affiliate link" });
    }
  });

  // Referral system routes
  app.post("/api/referral/generate", async (req, res) => {
    try {
      // Generate a device-based user ID if not provided
      const userId = req.body.userId || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const referralCode = await storage.generateReferralCode(userId);
      res.json(referralCode);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  app.post("/api/referral/use", async (req, res) => {
    try {
      const { code } = req.body;
      const deviceId = req.body.deviceId || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await storage.useReferralCode(code, deviceId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to use referral code" });
    }
  });

  app.get("/api/referral/status", async (req, res) => {
    try {
      const userId = req.query.userId as string || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const status = await storage.getReferralStatus(userId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: "Failed to get referral status" });
    }
  });

  // Leaderboard route
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // Update user stats (for tracking savings)
  app.post("/api/user-stats", async (req, res) => {
    try {
      const { userId, savings } = req.body;
      await storage.updateUserStats(userId, savings);
      res.json({ message: "Stats updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user stats" });
    }
  });

  // Savings progress routes
  app.post('/api/savings/update', async (req, res) => {
    try {
      const { userId, amount } = req.body;
      if (!userId || !amount) {
        return res.status(400).json({ message: 'User ID and amount required' });
      }
      
      const result = await storage.updateSavingsProgress(userId, amount);
      res.json(result);
    } catch (error) {
      console.error('Error updating savings progress:', error);
      res.status(500).json({ message: 'Failed to update savings progress' });
    }
  });

  app.post('/api/username/update', async (req, res) => {
    try {
      const { userId, username } = req.body;
      if (!userId || !username) {
        return res.status(400).json({ message: 'User ID and username required' });
      }
      
      await storage.updateUsername(userId, username);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating username:', error);
      res.status(500).json({ message: 'Failed to update username' });
    }
  });

  // Test route to regenerate bonus codes
  app.post('/api/regenerate-bonus', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: 'User ID required' });
      }
      
      await storage.regenerateBonusCodesIfNeeded(userId);
      res.json({ success: true, message: 'Bonus codes regenerated' });
    } catch (error) {
      console.error('Error regenerating bonus codes:', error);
      res.status(500).json({ message: 'Failed to regenerate bonus codes' });
    }
  });

  // User Ideas endpoints
  app.post("/api/user-ideas", async (req, res) => {
    try {
      const { idea, deviceId } = req.body;
      
      if (!idea || !deviceId) {
        return res.status(400).json({ message: "Idea and deviceId are required" });
      }

      if (idea.length > 20) {
        return res.status(400).json({ message: "Idea must be 20 characters or less" });
      }

      const words = idea.trim().split(/\s+/);
      if (words.length > 2) {
        return res.status(400).json({ message: "Idea must be 2 words maximum" });
      }

      const newIdea = await storage.submitUserIdea(deviceId, idea.trim());
      res.json(newIdea);
    } catch (error) {
      if (error.message === "Device has already submitted an idea") {
        return res.status(409).json({ message: "You have already submitted an idea" });
      }
      console.error("Error submitting idea:", error);
      res.status(500).json({ message: "Failed to submit idea" });
    }
  });

  app.get("/api/admin/user-ideas", async (req, res) => {
    try {
      const ideas = await storage.getAllUserIdeas();
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching user ideas:", error);
      res.status(500).json({ message: "Failed to fetch user ideas" });
    }
  });

  app.put("/api/admin/user-ideas/:id/review", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.markIdeaAsReviewed(id);
      
      if (!updated) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error marking idea as reviewed:", error);
      res.status(500).json({ message: "Failed to mark idea as reviewed" });
    }
  });

  // OpenAI Chat API endpoint
  app.post("/api/ai-chat", async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get available products for AI context
      const availableProducts = await storage.getPublishedAffiliateLinks();
      
      // Generate AI response using Cohere
      const aiResult = await generateAIChatResponse(
        message, 
        conversationHistory || [], 
        availableProducts
      );

      res.json({
        response: aiResult.response,
        recommendedProduct: aiResult.recommendedProduct,
        confidence: aiResult.confidence,
        hasCohere: true
      });
      
    } catch (error) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ 
        error: "Cohere service unavailable",
        hasCohere: false,
        fallback: true
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

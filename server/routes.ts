import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAffiliateLinkSchema } from "@shared/schema";
import { z } from "zod";

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

// Periodically update counters
setInterval(() => {
  checkHourlyReset();
  
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

  // Create new affiliate link
  app.post("/api/affiliate-links", async (req, res) => {
    try {
      const linkData = insertAffiliateLinkSchema.parse(req.body);
      const newLink = await storage.createAffiliateLink(linkData);
      res.status(201).json(newLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid link data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create affiliate link" });
      }
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

  const httpServer = createServer(app);
  return httpServer;
}

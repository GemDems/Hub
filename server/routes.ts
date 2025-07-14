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

  // Get all affiliate links
  app.get("/api/affiliate-links", async (req, res) => {
    try {
      const links = await storage.getAllAffiliateLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch affiliate links" });
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

  const httpServer = createServer(app);
  return httpServer;
}

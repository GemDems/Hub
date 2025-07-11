import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAffiliateLinkSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

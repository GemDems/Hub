import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const affiliateLinks = pgTable("affiliate_links", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  imageUrls: text("image_urls").array(),
  price: text("price"),
  clicks: integer("clicks").notNull().default(0),
  stock: integer("stock").default(0),
  isElitePick: integer("is_elite_pick").default(0), // Using integer for boolean compatibility
  isVerified: integer("is_verified").default(0), // Verified source badge (Amazon/Walmart/etc)
  isDraft: integer("is_draft").default(0), // Draft status - 0 = published, 1 = draft
  scheduledPublishAt: timestamp("scheduled_publish_at"), // When to auto-publish draft
  scheduledDeleteAt: timestamp("scheduled_delete_at"), // When to auto-delete product
  // Private field for AI - not shown to users anywhere, only for AI analysis
  aiPrivateInfo: text("ai_private_info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralCodes = pgTable("referral_codes", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(),
  userId: text("user_id").notNull(),
  usedCount: integer("used_count").default(0),
  usedDevices: text("used_devices").array().default([]),
  isVip: integer("is_vip").default(0), // Using integer for boolean compatibility
  isDoublePoints: integer("is_double_points").default(0), // Double referral points code
  codeType: text("code_type").default("regular"), // "regular", "seinfeld", "double_points"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").unique().notNull(),
  username: text("username"), // Display name for leaderboard (Name/F format)
  totalSavings: integer("total_savings").default(0),
  referralCount: integer("referral_count").default(0),
  totalCodesShared: integer("total_codes_shared").default(0), // Total referral codes shared in lifetime
  isVip: integer("is_vip").default(0), // Using integer for boolean compatibility
  savingsProgress: integer("savings_progress").default(0), // Tracks click savings progress toward $1000
  hasSeinfeldCode: integer("has_seinfeld_code").default(0), // Level 1 reward unlock
  invitesUsedCount: integer("invites_used_count").default(0), // How many different invite codes this user has used
  lastActive: timestamp("last_active").defaultNow().notNull(),
});

export const userIdeas = pgTable("user_ideas", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  idea: text("idea").notNull(), // 2 words max, 20 characters max
  isReviewed: integer("is_reviewed").default(0), // 0 = new, 1 = reviewed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAffiliateLinkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Valid URL is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional().or(z.null()),
  imageUrls: z.array(z.string()).optional().or(z.null()),
  price: z.string().optional().or(z.null()),
  stock: z.number().optional().default(0),
  isElitePick: z.number().optional().default(0),
  isVerified: z.number().optional().default(0),
  isDraft: z.number().optional().default(0),
  scheduledPublishAt: z.date().optional().or(z.null()),
  scheduledDeleteAt: z.date().optional().or(z.null()),
  aiPrivateInfo: z.string().optional().or(z.null()),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = z.infer<typeof insertAffiliateLinkSchema>;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type UserIdea = typeof userIdeas.$inferSelect;
export type InsertUserIdea = typeof userIdeas.$inferInsert;

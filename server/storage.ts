import { users, affiliateLinks, referralCodes, userStats, type User, type InsertUser, type AffiliateLink, type InsertAffiliateLink, type ReferralCode, type UserStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Affiliate Links
  getAllAffiliateLinks(): Promise<AffiliateLink[]>;
  getAffiliateLinkById(id: number): Promise<AffiliateLink | undefined>;
  createAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink>;
  updateAffiliateLink(id: number, link: Partial<AffiliateLink>): Promise<AffiliateLink | undefined>;
  deleteAffiliateLink(id: number): Promise<boolean>;
  incrementLinkClicks(id: number): Promise<AffiliateLink | undefined>;
  
  // Referral System
  generateReferralCode(userId: string): Promise<ReferralCode>;
  useReferralCode(code: string, deviceId: string): Promise<{ vipUnlocked: boolean; usedCount: number }>;
  getReferralStatus(userId: string): Promise<{ myCode?: string; usedCount: number; isVip: boolean }>;
  
  // User Stats & Leaderboard
  updateUserStats(userId: string, savings: number): Promise<void>;
  getLeaderboard(): Promise<{ topSavers: any[]; topReferrers: any[] }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllAffiliateLinks(): Promise<AffiliateLink[]> {
    const links = await db.select().from(affiliateLinks);
    return links;
  }

  async getAffiliateLinkById(id: number): Promise<AffiliateLink | undefined> {
    const [link] = await db.select().from(affiliateLinks).where(eq(affiliateLinks.id, id));
    return link || undefined;
  }

  async createAffiliateLink(insertLink: InsertAffiliateLink): Promise<AffiliateLink> {
    const [link] = await db
      .insert(affiliateLinks)
      .values({
        ...insertLink,
        imageUrl: insertLink.imageUrl || null,
        clicks: 0
      })
      .returning();
    return link;
  }

  async updateAffiliateLink(id: number, updateData: Partial<AffiliateLink>): Promise<AffiliateLink | undefined> {
    const [updated] = await db
      .update(affiliateLinks)
      .set(updateData)
      .where(eq(affiliateLinks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAffiliateLink(id: number): Promise<boolean> {
    const result = await db
      .delete(affiliateLinks)
      .where(eq(affiliateLinks.id, id))
      .returning();
    return result.length > 0;
  }

  async incrementLinkClicks(id: number): Promise<AffiliateLink | undefined> {
    const current = await this.getAffiliateLinkById(id);
    if (!current) return undefined;
    
    const [updated] = await db
      .update(affiliateLinks)
      .set({ clicks: current.clicks + 1 })
      .where(eq(affiliateLinks.id, id))
      .returning();
    return updated || undefined;
  }

  // Referral System Methods
  async generateReferralCode(userId: string): Promise<ReferralCode> {
    // Generate unique code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase() + 
                 Math.random().toString(36).substring(2, 4).toUpperCase();
    
    const [referralCode] = await db
      .insert(referralCodes)
      .values({
        code,
        userId,
        usedCount: 0,
        usedDevices: [],
        isVip: 0
      })
      .returning();
    return referralCode;
  }

  async useReferralCode(code: string, deviceId: string): Promise<{ vipUnlocked: boolean; usedCount: number }> {
    const [referralCode] = await db.select().from(referralCodes).where(eq(referralCodes.code, code));
    
    if (!referralCode) {
      throw new Error('Invalid referral code');
    }

    // Check if device already used ANY code (one code per device limit)
    const existingUsage = await db
      .select()
      .from(referralCodes)
      .where(sql`${referralCodes.usedDevices} @> ${JSON.stringify([deviceId])}`);
    
    if (existingUsage.length > 0) {
      throw new Error('This device has already used a referral code');
    }

    const newUsedDevices = [...referralCode.usedDevices, deviceId];
    const newUsedCount = newUsedDevices.length;
    const vipUnlocked = newUsedCount >= 3 && !referralCode.isVip;

    // Update referral code
    await db
      .update(referralCodes)
      .set({
        usedCount: newUsedCount,
        usedDevices: newUsedDevices,
        isVip: vipUnlocked ? 1 : referralCode.isVip
      })
      .where(eq(referralCodes.code, code));

    // Update user stats if VIP unlocked
    if (vipUnlocked) {
      await this.updateUserVipStatus(referralCode.userId, true);
    }

    return { vipUnlocked, usedCount: newUsedCount };
  }

  async getReferralStatus(userId: string): Promise<{ myCode?: string; usedCount: number; isVip: boolean }> {
    const [referralCode] = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId));
    const [userStat] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    return {
      myCode: referralCode?.code,
      usedCount: referralCode?.usedCount || 0,
      isVip: Boolean(userStat?.isVip || referralCode?.isVip)
    };
  }

  private async updateUserVipStatus(userId: string, isVip: boolean): Promise<void> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (existingStats) {
      await db
        .update(userStats)
        .set({ isVip: isVip ? 1 : 0, referralCount: existingStats.referralCount + 1 })
        .where(eq(userStats.userId, userId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalSavings: 0,
          referralCount: 1,
          isVip: isVip ? 1 : 0
        });
    }
  }

  async updateUserStats(userId: string, savings: number): Promise<void> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (existingStats) {
      await db
        .update(userStats)
        .set({ 
          totalSavings: existingStats.totalSavings + savings,
          lastActive: new Date()
        })
        .where(eq(userStats.userId, userId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalSavings: savings,
          referralCount: 0,
          isVip: 0
        });
    }
  }

  async getLeaderboard(): Promise<{ topSavers: any[]; topReferrers: any[] }> {
    const topSavers = await db
      .select({
        userId: userStats.userId,
        totalSavings: userStats.totalSavings,
        isVip: userStats.isVip
      })
      .from(userStats)
      .orderBy(desc(userStats.totalSavings))
      .limit(10);

    const topReferrers = await db
      .select({
        userId: userStats.userId,
        referralCount: userStats.referralCount,
        isVip: userStats.isVip
      })
      .from(userStats)
      .where(sql`${userStats.isVip} = 1`)
      .orderBy(desc(userStats.referralCount))
      .limit(10);

    return { topSavers, topReferrers };
  }
}

export const storage = new DatabaseStorage();

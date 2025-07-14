import { users, affiliateLinks, referralCodes, userStats, type User, type InsertUser, type AffiliateLink, type InsertAffiliateLink, type ReferralCode, type UserStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Affiliate Links
  getAllAffiliateLinks(): Promise<AffiliateLink[]>;
  getPublishedAffiliateLinks(): Promise<AffiliateLink[]>;
  getDraftAffiliateLinks(): Promise<AffiliateLink[]>;
  getAffiliateLinkById(id: number): Promise<AffiliateLink | undefined>;
  createAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink>;
  updateAffiliateLink(id: number, link: Partial<AffiliateLink>): Promise<AffiliateLink | undefined>;
  deleteAffiliateLink(id: number): Promise<boolean>;
  publishDraft(id: number): Promise<AffiliateLink | undefined>;
  incrementLinkClicks(id: number): Promise<AffiliateLink | undefined>;
  
  // Referral System
  generateReferralCode(userId: string): Promise<ReferralCode>;
  useReferralCode(code: string, deviceId: string): Promise<{ vipUnlocked: boolean; usedCount: number }>;
  getReferralStatus(userId: string): Promise<{ myCode?: string; usedCount: number; isVip: boolean }>;
  
  // User Stats & Leaderboard
  updateUserStats(userId: string, savings: number): Promise<void>;
  updateSavingsProgress(userId: string, amount: number): Promise<{ hasReward: boolean; newProgress: number }>;
  updateUsername(userId: string, username: string): Promise<void>;
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

  async getPublishedAffiliateLinks(): Promise<AffiliateLink[]> {
    const links = await db.select().from(affiliateLinks).where(eq(affiliateLinks.isDraft, 0));
    return links;
  }

  async getDraftAffiliateLinks(): Promise<AffiliateLink[]> {
    const links = await db.select().from(affiliateLinks).where(eq(affiliateLinks.isDraft, 1));
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
        clicks: 0,
        isVerified: insertLink.isVerified ? 1 : 0,
        isDraft: insertLink.isDraft ? 1 : 0
      })
      .returning();
    return link;
  }

  async publishDraft(id: number): Promise<AffiliateLink | undefined> {
    const [updated] = await db
      .update(affiliateLinks)
      .set({ isDraft: 0 })
      .where(eq(affiliateLinks.id, id))
      .returning();
    return updated || undefined;
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
        isVip: 0,
        isDoublePoints: 0,
        codeType: "regular"
      })
      .returning();
    return referralCode;
  }

  async useReferralCode(code: string, deviceId: string): Promise<{ vipUnlocked: boolean; usedCount: number }> {
    const [referralCode] = await db.select().from(referralCodes).where(eq(referralCodes.code, code));
    
    if (!referralCode) {
      throw new Error('Invalid referral code');
    }

    // Check if device already used THIS SPECIFIC code (prevent duplicate uses of same code)
    if (referralCode.usedDevices.includes(deviceId)) {
      throw new Error('This device has already used this referral code');
    }

    // Determine points to add based on code type
    const pointsToAdd = referralCode.isDoublePoints ? 2 : 1;
    const newUsedDevices = [...referralCode.usedDevices, deviceId];
    const newUsedCount = (referralCode.usedCount || 0) + 1;
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

    // Update user stats - add referral points (1 or 2 based on code type)
    await this.updateUserReferralCount(referralCode.userId, pointsToAdd);
    
    // CRITICAL: When bonus codes are used, increment the ORIGINAL code owner's leaderboard invites
    // This ensures that $1000 reward codes properly boost the owner's leaderboard ranking
    await this.incrementCodeOwnerLeaderboardInvites(referralCode.userId, pointsToAdd);
    
    // Update the user's invite usage count (increment by 1 for each different code used)
    await this.incrementUserInviteUsageCount(deviceId);
    
    // Update VIP status if needed
    if (vipUnlocked) {
      await this.updateUserVipStatus(referralCode.userId, true);
    }

    return { vipUnlocked, usedCount: newUsedCount };
  }

  async getReferralStatus(userId: string): Promise<{ myCode?: string; usedCount: number; isVip: boolean; username?: string; totalCodesShared?: number; invitesUsedCount?: number; rewardCodes?: any[] }> {
    // Get primary referral code (first regular code)
    const [referralCode] = await db.select().from(referralCodes)
      .where(sql`${referralCodes.userId} = ${userId} AND ${referralCodes.codeType} = 'regular'`)
      .orderBy(referralCodes.createdAt)
      .limit(1);
    
    const [userStat] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    // Always ensure users with $1000+ saved have bonus codes available
    if (userStat && userStat.savingsProgress >= 1000) {
      const existingBonusCodes = await db.select().from(referralCodes)
        .where(sql`${referralCodes.userId} = ${userId} AND ${referralCodes.codeType} IN ('bonus_2x', 'bonus_regular')`);
      
      // Always generate bonus codes if none exist
      if (existingBonusCodes.length === 0) {
        await this.generateRewardCodes(userId);
      }
    }
    
    // Get all user's codes including reward codes
    const allUserCodes = await db.select().from(referralCodes).where(eq(referralCodes.userId, userId));
    const rewardCodes = allUserCodes.filter(code => code.codeType && code.codeType !== "regular");
    
    // Calculate total codes shared: sum of all codes usage
    const totalUsageCount = allUserCodes.reduce((sum, code) => sum + (code.usedCount || 0), 0);
    
    return {
      myCode: referralCode?.code,
      usedCount: referralCode?.usedCount || 0,
      isVip: Boolean(userStat?.isVip || referralCode?.isVip),
      username: userStat?.username,
      totalCodesShared: totalUsageCount,
      invitesUsedCount: userStat?.invitesUsedCount || 0,
      rewardCodes
    };
  }

  private async updateUserVipStatus(userId: string, isVip: boolean): Promise<void> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (existingStats) {
      await db
        .update(userStats)
        .set({ 
          isVip: isVip ? 1 : 0,
          lastActive: new Date()
        })
        .where(eq(userStats.userId, userId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalSavings: 0,
          referralCount: 0,
          totalCodesShared: 0,
          isVip: isVip ? 1 : 0
        });
    }
  }

  private async updateUserReferralCount(userId: string, pointsToAdd: number): Promise<void> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (existingStats) {
      await db
        .update(userStats)
        .set({ 
          referralCount: (existingStats.referralCount || 0) + pointsToAdd,
          lastActive: new Date()
        })
        .where(eq(userStats.userId, userId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          referralCount: pointsToAdd,
          totalSavings: 0,
          totalCodesShared: 0,
          invitesUsedCount: 0,
          isVip: 0
        });
    }
  }

  private async incrementUserInviteUsageCount(deviceId: string): Promise<void> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, deviceId));
    
    if (existingStats) {
      await db
        .update(userStats)
        .set({ 
          invitesUsedCount: (existingStats.invitesUsedCount || 0) + 1,
          lastActive: new Date()
        })
        .where(eq(userStats.userId, deviceId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId: deviceId,
          referralCount: 0,
          totalSavings: 0,
          totalCodesShared: 0,
          invitesUsedCount: 1,
          isVip: 0
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

  async updateSavingsProgress(userId: string, amount: number): Promise<{ hasReward: boolean; newProgress: number }> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    const currentProgress = existingStats?.savingsProgress || 0;
    const newProgress = currentProgress + amount;
    const hasReward = newProgress >= 1000 && currentProgress < 1000 && !existingStats?.hasSeinfeldCode;

    // Generate reward codes when hitting $1000 milestone for first time
    if (hasReward) {
      await this.generateRewardCodes(userId);
    }

    // Also ensure bonus codes exist for anyone above $1000
    if (newProgress >= 1000) {
      const existingBonusCodes = await db.select().from(referralCodes)
        .where(sql`${referralCodes.userId} = ${userId} AND ${referralCodes.codeType} IN ('bonus_2x', 'bonus_regular')`);
      
      if (existingBonusCodes.length === 0) {
        await this.generateRewardCodes(userId);
      }
    }

    if (existingStats) {
      await db
        .update(userStats)
        .set({
          savingsProgress: newProgress,
          hasSeinfeldCode: hasReward ? 1 : existingStats.hasSeinfeldCode,
          lastActive: new Date()
        })
        .where(eq(userStats.userId, userId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          savingsProgress: newProgress,
          hasSeinfeldCode: hasReward ? 1 : 0,
          totalSavings: 0,
          referralCount: 0,
          totalCodesShared: 0,
          invitesUsedCount: 0,
          isVip: 0
        });
    }

    return { hasReward, newProgress };
  }

  async updateUsername(userId: string, username: string): Promise<void> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (existingStats) {
      await db
        .update(userStats)
        .set({ 
          username,
          lastActive: new Date()
        })
        .where(eq(userStats.userId, userId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          username,
          totalSavings: 0,
          referralCount: 0,
          totalCodesShared: 0,
          invitesUsedCount: 0,
          isVip: 0
        });
    }
  }



  async getLeaderboard(): Promise<{ topSavers: any[]; topReferrers: any[] }> {
    // Auto-promote users who qualify for leaderboard
    await this.autoPromoteQualifyingUsers();
    
    // Top savers: Only VIP users with usernames and savings progress > 0
    const topSavers = await db
      .select({
        username: userStats.username,
        totalSavings: userStats.savingsProgress,
        isVip: userStats.isVip
      })
      .from(userStats)
      .where(sql`${userStats.savingsProgress} > 0 AND ${userStats.isVip} = 1 AND ${userStats.username} IS NOT NULL`)
      .orderBy(desc(userStats.savingsProgress))
      .limit(10);

    // Top referrers: Only VIP users with usernames and 3+ invites used  
    const topReferrers = await db
      .select({
        username: userStats.username,
        referralCount: userStats.invitesUsedCount,
        isVip: userStats.isVip
      })
      .from(userStats)
      .where(sql`${userStats.invitesUsedCount} >= 3 AND ${userStats.isVip} = 1 AND ${userStats.username} IS NOT NULL`)
      .orderBy(desc(userStats.invitesUsedCount))
      .limit(10);

    return { topSavers, topReferrers };
  }

  // Generate reward codes when user has $1000+ saved
  private async generateRewardCodes(userId: string): Promise<void> {
    // Generate unique random codes each time
    const bonusCode1 = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                       Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const bonusCode2 = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                       Math.random().toString(36).substring(2, 6).toUpperCase();
    
    // Insert both reward codes as additional invite codes
    await db.insert(referralCodes).values([
      {
        code: bonusCode1,
        userId,
        usedCount: 0,
        usedDevices: [],
        isVip: 0,
        isDoublePoints: 1,
        codeType: "bonus_2x"
      },
      {
        code: bonusCode2,
        userId,
        usedCount: 0,
        usedDevices: [],
        isVip: 0,
        isDoublePoints: 0,
        codeType: "bonus_regular"
      }
    ]);
  }

  // Method to regenerate bonus codes for existing users with $1000+
  async regenerateBonusCodesIfNeeded(userId: string): Promise<void> {
    const [userStat] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (userStat && userStat.savingsProgress >= 1000) {
      // Delete existing bonus codes
      await db.delete(referralCodes)
        .where(sql`${referralCodes.userId} = ${userId} AND ${referralCodes.codeType} IN ('bonus_2x', 'bonus_regular')`);
      
      // Generate fresh bonus codes
      await this.generateRewardCodes(userId);
    }
  }

  private async incrementCodeOwnerLeaderboardInvites(userId: string, pointsToAdd: number): Promise<void> {
    const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (existingStats) {
      await db
        .update(userStats)
        .set({ 
          invitesUsedCount: (existingStats.invitesUsedCount || 0) + pointsToAdd,
          lastActive: new Date()
        })
        .where(eq(userStats.userId, userId));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalSavings: 0,
          referralCount: 0,
          totalCodesShared: 0,
          invitesUsedCount: pointsToAdd,
          isVip: 0
        });
    }
  }

  private async autoPromoteQualifyingUsers(): Promise<void> {
    // Get current leaderboard (top 10 VIP users)
    const currentTopReferrers = await db
      .select({
        userId: userStats.userId,
        username: userStats.username,
        referralCount: userStats.invitesUsedCount,
        isVip: userStats.isVip
      })
      .from(userStats)
      .where(sql`${userStats.invitesUsedCount} >= 3 AND ${userStats.isVip} = 1 AND ${userStats.username} IS NOT NULL`)
      .orderBy(desc(userStats.invitesUsedCount))
      .limit(10);

    // Find the minimum invite count to qualify for leaderboard
    const minQualifyingInvites = currentTopReferrers.length === 10 
      ? currentTopReferrers[9].referralCount 
      : 3; // Default to 3 invites minimum

    // Find users with usernames and 3+ invites who could qualify
    const potentialQualifiers = await db
      .select()
      .from(userStats)
      .where(sql`${userStats.invitesUsedCount} >= 3 AND ${userStats.username} IS NOT NULL`);

    // Process each potential qualifier
    for (const user of potentialQualifiers) {
      const userInvites = user.invitesUsedCount || 0;
      
      // If user has more invites than minimum threshold
      if (userInvites > minQualifyingInvites) {
        
        // Check if user is already VIP
        if (!user.isVip) {
          // Promote to VIP
          await db
            .update(userStats)
            .set({ 
              isVip: 1,
              lastActive: new Date()
            })
            .where(eq(userStats.userId, user.userId));
        }

        // If leaderboard is full (10 members), demote the lowest member
        if (currentTopReferrers.length === 10 && userInvites > currentTopReferrers[9].referralCount) {
          const lowestMember = currentTopReferrers[9];
          
          // Demote the lowest member from VIP status
          await db
            .update(userStats)
            .set({ 
              isVip: 0,
              lastActive: new Date()
            })
            .where(eq(userStats.userId, lowestMember.userId));
        }
      }
    }

    // Ensure all devices with usernames have stats entries
    await this.ensureStatsForUsernameDevices();
  }

  private async ensureStatsForUsernameDevices(): Promise<void> {
    // Get all devices that have usernames but might not have user_stats entries
    const allUsernames = await db
      .select({ userId: userStats.userId })
      .from(userStats)
      .where(sql`${userStats.username} IS NOT NULL`);

    // Create stats entries for any device that doesn't have one yet
    const deviceIds = allUsernames.map(u => u.userId);
    
    for (const deviceId of deviceIds) {
      const [existingStats] = await db.select().from(userStats).where(eq(userStats.userId, deviceId));
      
      if (!existingStats) {
        await db
          .insert(userStats)
          .values({
            userId: deviceId,
            totalSavings: 0,
            referralCount: 0,
            totalCodesShared: 0,
            invitesUsedCount: 0,
            isVip: 0
          });
      }
    }
  }
}

export const storage = new DatabaseStorage();

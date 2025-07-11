import { users, affiliateLinks, type User, type InsertUser, type AffiliateLink, type InsertAffiliateLink } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
    const [updated] = await db
      .update(affiliateLinks)
      .set({ clicks: db.sql`${affiliateLinks.clicks} + 1` })
      .where(eq(affiliateLinks.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();

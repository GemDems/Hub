import { users, affiliateLinks, type User, type InsertUser, type AffiliateLink, type InsertAffiliateLink } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private affiliateLinks: Map<number, AffiliateLink>;
  private currentUserId: number;
  private currentLinkId: number;

  constructor() {
    this.users = new Map();
    this.affiliateLinks = new Map();
    this.currentUserId = 1;
    this.currentLinkId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllAffiliateLinks(): Promise<AffiliateLink[]> {
    return Array.from(this.affiliateLinks.values());
  }

  async getAffiliateLinkById(id: number): Promise<AffiliateLink | undefined> {
    return this.affiliateLinks.get(id);
  }

  async createAffiliateLink(insertLink: InsertAffiliateLink): Promise<AffiliateLink> {
    const id = this.currentLinkId++;
    const link: AffiliateLink = { 
      ...insertLink, 
      id, 
      clicks: 0,
      imageUrl: insertLink.imageUrl || null
    };
    this.affiliateLinks.set(id, link);
    return link;
  }

  async updateAffiliateLink(id: number, updateData: Partial<AffiliateLink>): Promise<AffiliateLink | undefined> {
    const existing = this.affiliateLinks.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.affiliateLinks.set(id, updated);
    return updated;
  }

  async deleteAffiliateLink(id: number): Promise<boolean> {
    return this.affiliateLinks.delete(id);
  }

  async incrementLinkClicks(id: number): Promise<AffiliateLink | undefined> {
    const link = this.affiliateLinks.get(id);
    if (!link) return undefined;
    
    const updated = { ...link, clicks: link.clicks + 1 };
    this.affiliateLinks.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

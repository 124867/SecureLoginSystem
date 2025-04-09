import { users, emails, type User, type InsertUser, type Email, type InsertEmail } from "@shared/schema";
import session from "express-session";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import pg_connect from "connect-pg-simple";

// Create a PostgreSQL session store
const PostgresSessionStore = pg_connect(session);

// Interface defining storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email operations
  getEmailById(id: number): Promise<Email | undefined>;
  getUserEmails(userId: number, status: string): Promise<Email[]>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmailStatus(id: number, status: string): Promise<Email | undefined>;
  markEmailAsRead(id: number, read: boolean): Promise<Email | undefined>;
  markEmailAsStarred(id: number, starred: boolean): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;
  
  sessionStore: session.Store;
}

// Implementation using database storage
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Email methods
  async getEmailById(id: number): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email || undefined;
  }

  async getUserEmails(userId: number, status: string): Promise<Email[]> {
    // Handle starred case separately
    if (status === 'starred') {
      return await db
        .select()
        .from(emails)
        .where(
          and(
            eq(emails.userId, userId),
            eq(emails.starred, true)
          )
        )
        .orderBy(desc(emails.createdAt));
    }
    
    // For other statuses (inbox, sent, archived, trash)
    return await db
      .select()
      .from(emails)
      .where(
        and(
          eq(emails.userId, userId),
          status === 'inbox' ? eq(emails.status, 'inbox') :
          status === 'sent' ? eq(emails.status, 'sent') :
          status === 'archived' ? eq(emails.status, 'archived') :
          eq(emails.status, 'trash')
        )
      )
      .orderBy(desc(emails.createdAt));
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const [email] = await db
      .insert(emails)
      .values(insertEmail)
      .returning();
    return email;
  }

  async updateEmailStatus(id: number, status: string): Promise<Email | undefined> {
    let updatedEmail;
    
    // Process each status type separately to satisfy type checking
    if (status === 'inbox') {
      [updatedEmail] = await db
        .update(emails)
        .set({ status: 'inbox' })
        .where(eq(emails.id, id))
        .returning();
    } else if (status === 'sent') {
      [updatedEmail] = await db
        .update(emails)
        .set({ status: 'sent' })
        .where(eq(emails.id, id))
        .returning();
    } else if (status === 'archived') {
      [updatedEmail] = await db
        .update(emails)
        .set({ status: 'archived' })
        .where(eq(emails.id, id))
        .returning();
    } else if (status === 'trash') {
      [updatedEmail] = await db
        .update(emails)
        .set({ status: 'trash' })
        .where(eq(emails.id, id))
        .returning();
    }
    
    return updatedEmail;
  }

  async markEmailAsRead(id: number, read: boolean): Promise<Email | undefined> {
    const [email] = await db
      .update(emails)
      .set({ read })
      .where(eq(emails.id, id))
      .returning();
    return email;
  }

  async markEmailAsStarred(id: number, starred: boolean): Promise<Email | undefined> {
    const [email] = await db
      .update(emails)
      .set({ starred })
      .where(eq(emails.id, id))
      .returning();
    return email;
  }

  async deleteEmail(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(emails)
      .where(eq(emails.id, id))
      .returning();
    return !!deleted;
  }
}

// Export an instance of the database storage
export const storage = new DatabaseStorage();

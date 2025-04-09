import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { users } from "@shared/schema";

const { Pool } = pg;

// Create a PostgreSQL pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle ORM instance
export const db = drizzle(pool);

// Initialize the database
export async function initDb() {
  console.log("Initializing database connection");
  
  try {
    // Test the connection by querying the users table
    const result = await db.select().from(users).limit(1);
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}
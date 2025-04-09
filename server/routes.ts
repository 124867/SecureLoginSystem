import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertEmailSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() || req.headers.authorization) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Email routes
  
  // Get emails by folder (inbox, sent, archived, trash, starred)
  app.get("/api/emails/:folder", isAuthenticated, async (req, res) => {
    try {
      // Get user ID from authentication
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }

      const { folder } = req.params;
      const validFolders = ["inbox", "sent", "archived", "trash", "starred"];
      
      if (!validFolders.includes(folder)) {
        return res.status(400).json({ message: "Invalid folder specified" });
      }
      
      const emails = await storage.getUserEmails(userId, folder);
      res.json(emails);
    } catch (error) {
      console.error("Error getting emails:", error);
      res.status(500).json({ message: "Error retrieving emails" });
    }
  });

  // Get a single email by ID
  app.get("/api/emails/view/:id", isAuthenticated, async (req, res) => {
    try {
      const emailId = parseInt(req.params.id);
      const email = await storage.getEmailById(emailId);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      // Check if the email belongs to the authenticated user
      if (email.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Mark email as read if it's not already
      if (!email.read) {
        await storage.markEmailAsRead(emailId, true);
      }
      
      res.json(email);
    } catch (error) {
      console.error("Error getting email:", error);
      res.status(500).json({ message: "Error retrieving email" });
    }
  });

  // Create a new email (send an email)
  app.post("/api/emails", isAuthenticated, async (req, res) => {
    try {
      // Get user ID from authentication
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }

      // Validate request body
      const emailData = insertEmailSchema.parse({
        ...req.body,
        userId,
      });
      
      // Create the email
      const email = await storage.createEmail(emailData);
      
      res.status(201).json(email);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Error creating email:", error);
      res.status(500).json({ message: "Error sending email" });
    }
  });

  // Update email status (move to trash, archive, etc.)
  app.patch("/api/emails/:id/status", isAuthenticated, async (req, res) => {
    try {
      const emailId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Validate status
      if (!["inbox", "sent", "archived", "trash"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const email = await storage.getEmailById(emailId);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      // Check if the email belongs to the authenticated user
      if (email.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedEmail = await storage.updateEmailStatus(emailId, status);
      res.json(updatedEmail);
    } catch (error) {
      console.error("Error updating email status:", error);
      res.status(500).json({ message: "Error updating email" });
    }
  });

  // Mark email as read/unread
  app.patch("/api/emails/:id/read", isAuthenticated, async (req, res) => {
    try {
      const emailId = parseInt(req.params.id);
      const { read } = req.body;
      
      if (typeof read !== "boolean") {
        return res.status(400).json({ message: "Read status must be a boolean" });
      }
      
      const email = await storage.getEmailById(emailId);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      // Check if the email belongs to the authenticated user
      if (email.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedEmail = await storage.markEmailAsRead(emailId, read);
      res.json(updatedEmail);
    } catch (error) {
      console.error("Error marking email as read:", error);
      res.status(500).json({ message: "Error updating email" });
    }
  });

  // Mark email as starred/unstarred
  app.patch("/api/emails/:id/star", isAuthenticated, async (req, res) => {
    try {
      const emailId = parseInt(req.params.id);
      const { starred } = req.body;
      
      if (typeof starred !== "boolean") {
        return res.status(400).json({ message: "Starred status must be a boolean" });
      }
      
      const email = await storage.getEmailById(emailId);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      // Check if the email belongs to the authenticated user
      if (email.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedEmail = await storage.markEmailAsStarred(emailId, starred);
      res.json(updatedEmail);
    } catch (error) {
      console.error("Error marking email as starred:", error);
      res.status(500).json({ message: "Error updating email" });
    }
  });

  // Delete an email permanently
  app.delete("/api/emails/:id", isAuthenticated, async (req, res) => {
    try {
      const emailId = parseInt(req.params.id);
      
      const email = await storage.getEmailById(emailId);
      
      if (!email) {
        return res.status(404).json({ message: "Email not found" });
      }
      
      // Check if the email belongs to the authenticated user
      if (email.userId !== req.user?.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteEmail(emailId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting email:", error);
      res.status(500).json({ message: "Error deleting email" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

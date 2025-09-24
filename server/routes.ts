import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService } from "./services/geminiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate questions using Gemini AI
  app.post("/api/generate-questions", async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ 
          error: "Text content is required and must be a non-empty string" 
        });
      }

      if (text.length > 10000) {
        return res.status(400).json({ 
          error: "Text content is too long. Please limit to 10,000 characters." 
        });
      }

      console.log("Generating questions for text length:", text.length);
      
      const questions = await geminiService.generateQuestions(text);
      
      console.log("Generated", questions.length, "questions");
      
      res.json({ questions });
    } catch (error) {
      console.error("Error generating questions:", error);
      
      let errorMessage = "Failed to generate questions";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}

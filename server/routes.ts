import type { Express } from "express";
import { storage } from "./storage";
import OpenAI from "openai";
import type { Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // AI Setup (OpenRouter)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  // Demo user route (no auth)
  app.get("/api/auth/user", async (_req, res) => {
    try {
      const user = await storage.updateUser("demo-user", {});
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to load user" });
    }
  });

  // Dummy update route using demo-user
  app.patch("/api/user", async (req, res) => {
    try {
      const updates = (req.body ?? {}) as {
        ageGroup?: string;
        preferredLanguage?: string;
      };
      const user = await storage.updateUser("demo-user", updates);
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update user" });
    }
  });

  // AI route
  app.post("/ai", async (req, res) => {
    try {
      const message = req.body?.message;
      if (typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ error: "Body must be { message: string }" });
      }

      const completion = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      });

      return res.json({ reply: completion.choices[0].message.content });
    } catch (err: any) {
      console.error(err);
      const status =
        typeof err?.status === "number"
          ? err.status
          : typeof err?.statusCode === "number"
            ? err.statusCode
            : 500;
      return res.status(status).json({ error: "AI request failed" });
    }
  });

  return httpServer;
}
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { moods, habits, conversations, messages, users } from "@shared/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { openai } from "./replit_integrations/audio/client";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.patch(api.user.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.user.update.input.parse(req.body);
      const user = await storage.updateUser(req.user.claims.sub, input);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.get(api.moods.list.path, isAuthenticated, async (req: any, res) => {
    const m = await storage.getMoods(req.user.claims.sub);
    res.json(m);
  });

  app.post(api.moods.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.moods.create.input.parse(req.body);
      const m = await storage.createMood(req.user.claims.sub, input);
      res.status(201).json(m);
    } catch (err) {
      res.status(400).json({ message: "Failed to create mood" });
    }
  });

  app.get(api.habits.list.path, isAuthenticated, async (req: any, res) => {
    const date = req.query.date as string | undefined;
    const h = await storage.getHabits(req.user.claims.sub, date);
    res.json(h);
  });

  app.post(api.habits.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.habits.create.input.parse(req.body);
      const h = await storage.createHabit(req.user.claims.sub, input);
      res.status(201).json(h);
    } catch (err) {
      res.status(400).json({ message: "Failed to create habit" });
    }
  });

  app.patch('/api/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.habits.update.input.parse(req.body);
      const h = await storage.updateHabit(id, input);
      res.json(h);
    } catch (err) {
      res.status(400).json({ message: "Failed to update habit" });
    }
  });

  app.get(api.chat.list.path, isAuthenticated, async (req: any, res) => {
    const c = await db.select().from(conversations)
      .where(eq(conversations.userId, req.user.claims.sub))
      .orderBy(desc(conversations.createdAt));
    res.json(c);
  });

  app.post(api.chat.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.chat.create.input.parse(req.body);
      const [c] = await db.insert(conversations).values({ ...input, userId: req.user.claims.sub }).returning();
      res.status(201).json(c);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.get(api.chat.history.path, isAuthenticated, async (req: any, res) => {
    const id = parseInt(req.params.id);
    const m = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
    res.json(m);
  });

  app.post(api.chat.sendMessage.path, isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { content } = req.body;
      
      const userId = req.user.claims.sub;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      const systemPrompt = `You are TalkEasy, an AI therapist and mental wellness companion. 
The user is in the ${user?.ageGroup || 'General'} age group and prefers to speak in ${user?.preferredLanguage || 'English'}.
Your task is to:
1. Listen to emotional problems and respond with supportive messages.
2. Provide practical self-help suggestions when negative emotions (stress, sadness, anxiety, loneliness, anger) are detected.
3. Detect the primary emotional tone from the user's message.
4. Adapt advice to the user's age group (e.g. Teen -> exam stress, Young Adult -> work stress, Senior -> loneliness).
5. Output your response as JSON in the following format:
{
  "content": "Your supportive message and advice here...",
  "detectedEmotion": "One of: stress, sadness, anxiety, loneliness, anger, happiness, neutral",
  "aiSuggestion": "A short practical self-help step (e.g. breathing exercises, short walk, meditation) or null if none needed"
}

If the user expresses dangerous phrases like wanting to end their life, prioritize showing a supportive message encouraging them to contact a mental health helpline or trusted people.`;

      // Save user message
      await db.insert(messages).values({ conversationId: id, role: "user", content });

      // Get history
      const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
      
      const messagesForAI = [
        { role: "system", content: systemPrompt },
        ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: messagesForAI as any,
        response_format: { type: "json_object" },
        stream: false, 
      });

      const responseContent = stream.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(responseContent);
      
      // Save assistant message
      await db.insert(messages).values({ 
        conversationId: id, 
        role: "assistant", 
        content: parsed.content || "", 
        detectedEmotion: parsed.detectedEmotion, 
        aiSuggestion: parsed.aiSuggestion 
      });

      // Send to client as SSE
      res.write(`data: ${JSON.stringify({ content: parsed.content || "", detectedEmotion: parsed.detectedEmotion, aiSuggestion: parsed.aiSuggestion })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process message" });
      } else {
        res.write(`data: ${JSON.stringify({ error: "Failed to process message" })}\n\n`);
        res.end();
      }
    }
  });

  app.get(api.history.emotional.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    
    const userMoods = await db.select().from(moods).where(eq(moods.userId, userId)).orderBy(desc(moods.date));
    const userConvos = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.userId, userId));
    const convoIds = userConvos.map(c => c.id);
    
    let userMessages: any[] = [];
    if (convoIds.length > 0) {
      userMessages = await db.select()
        .from(messages)
        .where(
          and(
            inArray(messages.conversationId, convoIds),
            eq(messages.role, 'assistant')
          )
        ).orderBy(desc(messages.createdAt));
    }

    const history = [
      ...userMoods.map(m => ({
        id: m.id,
        date: typeof m.date === 'string' ? m.date : m.date.toISOString(),
        type: 'mood',
        value: m.mood,
        notes: m.notes
      })),
      ...userMessages.filter(m => m.detectedEmotion).map(m => ({
        id: m.id,
        date: m.createdAt.toISOString(),
        type: 'emotion',
        value: m.detectedEmotion,
        suggestion: m.aiSuggestion
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(history);
  });

  return httpServer;
}

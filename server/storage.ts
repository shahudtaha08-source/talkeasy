import { db } from "./db";
import { 
  users, moods, habits, conversations, messages,
  type User, type InsertMood, type Mood, type InsertHabit, type Habit
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Moods
  getMoods(userId: string): Promise<Mood[]>;
  createMood(userId: string, mood: InsertMood): Promise<Mood>;
  
  // Habits
  getHabits(userId: string, date?: string): Promise<Habit[]>;
  createHabit(userId: string, habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, updates: Partial<InsertHabit>): Promise<Habit>;

  // User
  updateUser(id: string, updates: Partial<User>): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getMoods(userId: string): Promise<Mood[]> {
    return await db.select().from(moods).where(eq(moods.userId, userId)).orderBy(desc(moods.date));
  }

  async createMood(userId: string, insertMood: InsertMood): Promise<Mood> {
    const [mood] = await db.insert(moods).values({ ...insertMood, userId }).returning();
    return mood;
  }

  async getHabits(userId: string, date?: string): Promise<Habit[]> {
    let query = db.select().from(habits).where(eq(habits.userId, userId));
    if (date) {
      // Basic date match
      query = query.where(eq(habits.date, date));
    }
    return await query;
  }

  async createHabit(userId: string, insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db.insert(habits).values({ ...insertHabit, userId }).returning();
    return habit;
  }

  async updateHabit(id: number, updates: Partial<InsertHabit>): Promise<Habit> {
    const [habit] = await db.update(habits).set(updates).where(eq(habits.id, id)).returning();
    return habit;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();

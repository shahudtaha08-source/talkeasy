import { db, hasDatabase } from "./db";
import {
  users,
  moods,
  habits,
  type User,
  type InsertMood,
  type Mood,
  type InsertHabit,
  type Habit,
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

function nowIso() {
  return new Date().toISOString();
}

class MemoryStorage implements IStorage {
  private userById = new Map<string, User>();
  private moodsByUserId = new Map<string, Mood[]>();
  private habitsByUserId = new Map<string, Habit[]>();
  private nextMoodId = 1;
  private nextHabitId = 1;

  constructor() {
    // Seed a demo user so the frontend can render without auth.
    this.userById.set("demo-user", {
      id: "demo-user",
      ageGroup: "adult",
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as User);
  }

  async getMoods(userId: string): Promise<Mood[]> {
    return (this.moodsByUserId.get(userId) ?? []).slice().reverse();
  }

  async createMood(userId: string, insertMood: InsertMood): Promise<Mood> {
    const list = this.moodsByUserId.get(userId) ?? [];
    const mood: Mood = {
      id: this.nextMoodId++,
      userId,
      mood: insertMood.mood,
      notes: insertMood.notes ?? null,
      date: insertMood.date ?? nowIso().slice(0, 10),
      createdAt: new Date(),
    } as unknown as Mood;
    list.push(mood);
    this.moodsByUserId.set(userId, list);
    return mood;
  }

  async getHabits(userId: string, date?: string): Promise<Habit[]> {
    const list = this.habitsByUserId.get(userId) ?? [];
    return date ? list.filter((h) => (h as any).date === date) : list;
  }

  async createHabit(userId: string, insertHabit: InsertHabit): Promise<Habit> {
    const list = this.habitsByUserId.get(userId) ?? [];
    const habit: Habit = {
      id: this.nextHabitId++,
      userId,
      type: insertHabit.type,
      completed: insertHabit.completed,
      notes: insertHabit.notes ?? null,
      date: insertHabit.date ?? nowIso().slice(0, 10),
      createdAt: new Date(),
    } as unknown as Habit;
    list.push(habit);
    this.habitsByUserId.set(userId, list);
    return habit;
  }

  async updateHabit(id: number, updates: Partial<InsertHabit>): Promise<Habit> {
    for (const [userId, list] of Array.from(this.habitsByUserId.entries())) {
      const idx = list.findIndex((h: Habit) => (h as any).id === id);
      if (idx !== -1) {
        const current = list[idx] as any;
        const next = { ...current, ...updates };
        list[idx] = next;
        this.habitsByUserId.set(userId, list);
        return next as Habit;
      }
    }
    throw new Error("Habit not found");
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const existing =
      this.userById.get(id) ??
      ({
        id,
        ageGroup: null,
        preferredLanguage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User);

    const next = {
      ...(existing as any),
      ...(updates as any),
      updatedAt: new Date(),
    } as User;

    this.userById.set(id, next);
    return next;
  }
}

export class DatabaseStorage implements IStorage {
  async getMoods(userId: string): Promise<Mood[]> {
    if (!db) throw new Error("Database not configured");
    return await db
      .select()
      .from(moods)
      .where(eq(moods.userId, userId))
      .orderBy(desc(moods.date));
  }

  async createMood(userId: string, insertMood: InsertMood): Promise<Mood> {
    if (!db) throw new Error("Database not configured");
    const [mood] = await db
      .insert(moods)
      .values({ ...insertMood, userId })
      .returning();
    return mood;
  }

  async getHabits(userId: string, date?: string): Promise<Habit[]> {
    if (!db) throw new Error("Database not configured");
    return date
      ? await db
          .select()
          .from(habits)
          .where(and(eq(habits.userId, userId), eq(habits.date, date)))
      : await db.select().from(habits).where(eq(habits.userId, userId));
  }

  async createHabit(userId: string, insertHabit: InsertHabit): Promise<Habit> {
    if (!db) throw new Error("Database not configured");
    const [habit] = await db
      .insert(habits)
      .values({ ...insertHabit, userId })
      .returning();
    return habit;
  }

  async updateHabit(id: number, updates: Partial<InsertHabit>): Promise<Habit> {
    if (!db) throw new Error("Database not configured");
    const [habit] = await db
      .update(habits)
      .set(updates)
      .where(eq(habits.id, id))
      .returning();
    return habit;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (!db) throw new Error("Database not configured");
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const storage: IStorage = hasDatabase ? new DatabaseStorage() : new MemoryStorage();

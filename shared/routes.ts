import { z } from 'zod';
import { insertMoodSchema, insertHabitSchema, users, moods, habits, conversations, messages } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  user: {
    get: {
      method: 'GET' as const,
      path: '/api/auth/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/user',
      input: z.object({ ageGroup: z.string().optional(), preferredLanguage: z.string().optional() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  moods: {
    list: {
      method: 'GET' as const,
      path: '/api/moods',
      responses: { 200: z.array(z.custom<typeof moods.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/moods',
      input: z.object({ mood: z.string(), notes: z.string().optional(), date: z.string().optional() }),
      responses: { 201: z.custom<typeof moods.$inferSelect>() }
    }
  },
  habits: {
    list: {
      method: 'GET' as const,
      path: '/api/habits',
      input: z.object({ date: z.string().optional() }).optional(),
      responses: { 200: z.array(z.custom<typeof habits.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/habits',
      input: z.object({ type: z.string(), completed: z.boolean(), notes: z.string().optional(), date: z.string().optional() }),
      responses: { 201: z.custom<typeof habits.$inferSelect>() }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/habits/:id',
      input: z.object({ completed: z.boolean().optional(), notes: z.string().optional() }),
      responses: { 200: z.custom<typeof habits.$inferSelect>() }
    }
  },
  chat: {
    list: {
      method: 'GET' as const,
      path: '/api/conversations',
      responses: { 200: z.array(z.custom<typeof conversations.$inferSelect>()) }
    },
    history: {
      method: 'GET' as const,
      path: '/api/conversations/:id/messages',
      responses: { 200: z.array(z.custom<typeof messages.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/conversations',
      input: z.object({ title: z.string() }),
      responses: { 201: z.custom<typeof conversations.$inferSelect>() }
    },
    sendMessage: {
      method: 'POST' as const,
      path: '/api/conversations/:id/messages',
      input: z.object({ content: z.string() }),
      responses: { 
        200: z.any() 
      }
    }
  },
  history: {
    emotional: {
      method: 'GET' as const,
      path: '/api/history/emotional',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          date: z.string(),
          type: z.enum(['mood', 'emotion']),
          value: z.string(),
          suggestion: z.string().optional(),
          notes: z.string().optional()
        }))
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

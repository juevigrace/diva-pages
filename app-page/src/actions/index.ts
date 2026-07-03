import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import type { SessionResponse } from 'diva-types/auth/responses';

export const server = {
  session: {
    saveSession: defineAction({
      accept: 'json',
      input: z.object({
        session_id: z.string(),
        user_id: z.string(),
        access_token: z.string(),
        refresh_token: z.string(),
        status: z.string(),
        type: z.string(),
        device: z.string(),
        ip: z.string(),
        agent: z.string(),
        access_expires_at: z.number(),
        refresh_expires_at: z.number(),
        created_at: z.number(),
        updated_at: z.number(),
      }),
      handler: async (input, ctx) => {
        ctx.session?.set('auth', input);
      },
    }),

    getSession: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await ctx.session?.get<SessionResponse>('auth');
        if (!session) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        return session;
      },
    }),

    deleteSession: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        ctx.session?.set('auth', undefined);
      },
    }),
  },
};

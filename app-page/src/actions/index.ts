import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import type { ActionAPIContext } from 'astro:actions';
import { apiFetch } from '@api/lib/fetch';
import { getDeviceLabel } from '@lib/device';
import type { SessionResponse } from 'diva-types/auth/responses/session';

type AccountsMap = Record<string, SessionResponse>;
type ActionContext = Pick<ActionAPIContext, 'session'>;

const REFRESH_BUFFER_MS = 60_000;

async function getAuth(ctx: ActionContext): Promise<SessionResponse | null> {
  return (await ctx.session?.get<SessionResponse>('auth')) ?? null;
}

async function getAccounts(ctx: ActionContext): Promise<AccountsMap> {
  return (await ctx.session?.get<AccountsMap>('accounts')) ?? {};
}

async function setActive(ctx: ActionContext, session: SessionResponse) {
  await ctx.session?.set('auth', session);
  await ctx.session?.set('activeUserId', session.user_id);
}

async function refreshSession(session: SessionResponse): Promise<SessionResponse | null> {
  const res = await apiFetch<SessionResponse>('/api/auth/refresh', {
    method: 'POST',
    body: { device: getDeviceLabel(session.agent), user_agent: session.agent },
    token: session.refresh_token,
  });
  if (!res.ok) return null;
  return res.json.data;
}

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
        device_id: z.string(),
        ip: z.string(),
        agent: z.string(),
        access_expires_at: z.number(),
        refresh_expires_at: z.number(),
        created_at: z.number(),
        updated_at: z.number(),
      }),
      handler: async (input, ctx) => {
        await ctx.session?.set('auth', input);
        const accounts = await getAccounts(ctx);
        accounts[input.user_id] = input;
        await ctx.session?.set('accounts', accounts);
        await ctx.session?.set('activeUserId', input.user_id);
      },
    }),

    getSession: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await getAuth(ctx);
        if (!session) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        return session;
      },
    }),

    deleteSession: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const active = await getAuth(ctx);
        const accounts = await getAccounts(ctx);
        if (active) {
          delete accounts[active.user_id];
        }
        const remaining = Object.values(accounts);
        if (remaining.length > 0) {
          await setActive(ctx, remaining[0]);
          await ctx.session?.set('accounts', accounts);
        } else {
          await ctx.session?.set('auth', undefined);
          await ctx.session?.set('accounts', undefined);
          await ctx.session?.set('activeUserId', undefined);
        }
        return { remaining: remaining.length };
      },
    }),

    switchAccount: defineAction({
      accept: 'json',
      input: z.object({ user_id: z.string() }),
      handler: async (input, ctx) => {
        const accounts = await getAccounts(ctx);
        const stored = accounts[input.user_id];
        if (!stored) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Account not found' });
        }
        let target = stored;
        if (stored.access_expires_at <= Date.now() + REFRESH_BUFFER_MS) {
          const refreshed = await refreshSession(stored);
          if (!refreshed) {
            delete accounts[input.user_id];
            await ctx.session?.set('accounts', accounts);
            throw new ActionError({ code: 'FORBIDDEN', message: 'Account session expired' });
          }
          target = refreshed;
          accounts[input.user_id] = refreshed;
          await ctx.session?.set('accounts', accounts);
        }
        await setActive(ctx, target);
        return target;
      },
    }),
  },

  auth: {
    refresh: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await getAuth(ctx);
        if (!session) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        const refreshed = await refreshSession(session);
        if (!refreshed) {
          throw new ActionError({ code: 'BAD_REQUEST', message: 'Refresh failed' });
        }
        await ctx.session?.set('auth', refreshed);
        const accounts = await getAccounts(ctx);
        accounts[refreshed.user_id] = refreshed;
        await ctx.session?.set('accounts', accounts);
        await ctx.session?.set('activeUserId', refreshed.user_id);
        return refreshed;
      },
    }),
  },

  restore: {
    saveEmail: defineAction({
      accept: 'json',
      input: z.object({ email: z.string() }),
      handler: async (input, ctx) => {
        await ctx.session?.set('restoreEmail', input.email);
      },
    }),
  },
};

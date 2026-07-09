import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { API_BASE_URL } from 'astro:env/server';
import type { SessionResponse } from 'diva-types/auth/responses';
import type { APIResponse } from 'diva-types/common/api-response';
import type { SignInDto, SignUpDto, ForgotPasswordConfirmDto } from 'diva-types/auth/dtos';

async function apiPost<T>(path: string, body?: unknown, token?: string): Promise<{ status: number; json: APIResponse<T> }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? (JSON.parse(text) as APIResponse<T>) : ({} as APIResponse<T>);
  return { status: res.status, json };
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

  auth: {
    signUp: defineAction({
      accept: 'json',
      input: z.object({
        email: z.string().email(),
        username: z.string().min(3),
        password: z.string().min(8),
        device: z.string().optional(),
        user_agent: z.string().optional(),
      }),
      handler: async (input, ctx) => {
        const dto: SignUpDto = {
          user: { email: input.email, username: input.username, password: input.password },
          session_data: { device: input.device || 'web', user_agent: input.user_agent || 'web' },
        };
        const { status, json } = await apiPost<SessionResponse>('/api/auth/signUp', dto);
        if (!status.toString().startsWith('2')) {
          throw new ActionError({ code: 'BAD_REQUEST', message: json.message || 'Sign up failed' });
        }
        await ctx.session?.set('auth', json.data);
        return json.data;
      },
    }),

    signIn: defineAction({
      accept: 'json',
      input: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        device: z.string().optional(),
        user_agent: z.string().optional(),
      }),
      handler: async (input, ctx) => {
        const dto: SignInDto = {
          username: input.username,
          password: input.password,
          session_data: { device: input.device || 'web', user_agent: input.user_agent || 'web' },
        };
        const { status, json } = await apiPost<SessionResponse>('/api/auth/signIn', dto);
        if (!status.toString().startsWith('2')) {
          throw new ActionError({ code: 'BAD_REQUEST', message: json.message || 'Sign in failed' });
        }
        await ctx.session?.set('auth', json.data);
        return json.data;
      },
    }),

    signOut: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await ctx.session?.get<SessionResponse>('auth');
        if (session) {
          await apiPost('/api/auth/signOut', {}, session.access_token);
        }
        ctx.session?.set('auth', undefined);
      },
    }),

    ping: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await ctx.session?.get<SessionResponse>('auth');
        if (!session) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        const { status } = await apiPost('/api/auth/ping', {}, session.access_token);
        return { ok: status.toString().startsWith('2') };
      },
    }),

    refresh: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await ctx.session?.get<SessionResponse>('auth');
        if (!session) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        const { status, json } = await apiPost<SessionResponse>('/api/auth/refresh', {}, session.access_token);
        if (!status.toString().startsWith('2')) {
          throw new ActionError({ code: 'BAD_REQUEST', message: json.message || 'Refresh failed' });
        }
        await ctx.session?.set('auth', json.data);
        return json.data;
      },
    }),

    forgotPasswordConfirm: defineAction({
      accept: 'json',
      input: z.object({
        id: z.string().min(1),
        device: z.string().optional(),
        user_agent: z.string().optional(),
      }),
      handler: async (input, ctx) => {
        const dto: ForgotPasswordConfirmDto = {
          id: input.id,
          session_data: { device: input.device || 'web', user_agent: input.user_agent || 'web' },
        };
        const { status, json } = await apiPost<SessionResponse>('/api/auth/forgot/password/confirm', dto);
        if (!status.toString().startsWith('2')) {
          throw new ActionError({ code: 'BAD_REQUEST', message: json.message || 'Confirmation failed' });
        }
        await ctx.session?.set('auth', json.data);
        return json.data;
      },
    }),
  },
};

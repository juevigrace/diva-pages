import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro/zod';
import { apiFetch } from '@api/lib/fetch';
import type { SessionResponse } from 'diva-types/auth/responses';
import type { SignInDto, SignUpDto, ForgotPasswordConfirmDto } from 'diva-types/auth/dtos';

function createAuthAction<TInput extends z.ZodTypeAny, TDto>(
  input: TInput,
  apiPath: string,
  toDto: (input: z.infer<TInput>, request: Request) => TDto,
  handler?: (session: SessionResponse, dto: TDto) => Promise<void>,
) {
  return defineAction({
    accept: 'json',
    input,
    handler: async (parsed, ctx) => {
      const dto = toDto(parsed, ctx.request);
      const res = await apiFetch<SessionResponse>(apiPath, { method: 'POST', body: dto });
      if (!res.ok) {
        throw new ActionError({ code: 'BAD_REQUEST', message: res.json.message || 'Request failed' });
      }
      await ctx.session?.set('auth', res.json.data);
      if (handler) await handler(res.json.data, dto);
      return res.json.data;
    },
  });
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
        await ctx.session?.set('auth', input);
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
        await ctx.session?.set('auth', undefined);
      },
    }),
  },

  auth: {
    signUp: createAuthAction(
      z.object({
        email: z.email().max(100),
        username: z.string().min(3).max(50),
        password: z.string().min(4).max(255),
        device: z.string().optional(),
        user_agent: z.string().optional(),
      }),
      '/api/auth/signUp',
      (input, request) => ({
        user: { email: input.email, username: input.username, password: input.password },
        session_data: { device: input.device || 'web', user_agent: input.user_agent || request.headers.get('User-Agent') || 'web' },
      } as SignUpDto),
    ),

    signIn: createAuthAction(
      z.object({
        username: z.string().min(1).max(100),
        password: z.string().min(1).max(1000),
        device: z.string().optional(),
        user_agent: z.string().optional(),
      }),
      '/api/auth/signIn',
      (input, request) => ({
        username: input.username,
        password: input.password,
        session_data: { device: input.device || 'web', user_agent: input.user_agent || request.headers.get('User-Agent') || 'web' },
      } as SignInDto),
    ),

    forgotPasswordConfirm: createAuthAction(
      z.object({
        id: z.string(),
        device: z.string().optional(),
        user_agent: z.string().optional(),
      }),
      '/api/auth/forgot/password/confirm',
      (input, request) => ({
        id: input.id,
        session_data: { device: input.device || 'web', user_agent: input.user_agent || request.headers.get('User-Agent') || 'web' },
      } as ForgotPasswordConfirmDto),
    ),

    signOut: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await ctx.session?.get<SessionResponse>('auth');
        if (session) {
          await apiFetch('/api/auth/signOut', { method: 'POST', body: { device: session.device, user_agent: session.agent }, token: session.access_token });
        }
        await ctx.session?.set('auth', undefined);
      },
    }),

    ping: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await ctx.session?.get<SessionResponse>('auth');
        if (!session) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        const res = await apiFetch('/api/auth/ping', { method: 'POST', token: session.access_token });
        return { ok: res.ok };
      },
    }),

    refresh: defineAction({
      accept: 'json',
      handler: async (_, ctx) => {
        const session = await ctx.session?.get<SessionResponse>('auth');
        if (!session) {
          throw new ActionError({ code: 'NOT_FOUND', message: 'Session not found' });
        }
        const res = await apiFetch<SessionResponse>('/api/auth/refresh', { method: 'POST', body: { device: session.device, user_agent: session.agent }, token: session.refresh_token });
        if (!res.ok) {
          throw new ActionError({ code: 'BAD_REQUEST', message: res.json.message || 'Refresh failed' });
        }
        await ctx.session?.set('auth', res.json.data);
        return res.json.data;
      },
    }),
  },
};

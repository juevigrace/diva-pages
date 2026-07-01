import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { API_BASE_URL } from '../lib/constants';

interface SessionData {
  device: string;
  user_agent: string;
}

interface AuthSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  status: string;
  type: string;
  device: string;
  agent: string;
  ip: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
  createdAt: number;
  updatedAt: number;
}

function getSessionData(context: { request: Request }): SessionData {
  return {
    device: 'web',
    user_agent: context.request.headers.get('user-agent') || '',
  };
}

async function fetchGo<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
  } = {},
): Promise<T> {
  const { method = 'POST', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new ActionError({
      code: 'BAD_REQUEST',
      message: json.message || 'Request failed',
    });
  }
  return json.data as T;
}

export const server = {
  auth: {
    signIn: defineAction({
      accept: 'form',
      input: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
      }),
      handler: async (input, context) => {
        const data = await fetchGo<AuthSession>('/api/auth/signIn', {
          body: {
            username: input.username,
            password: input.password,
            session_data: getSessionData(context),
          },
        });

        context.session!.set('auth', {
          userId: data.userId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          status: data.status,
          type: data.type,
          device: data.device,
          agent: data.agent,
          ip: data.ip,
          accessExpiresAt: data.accessExpiresAt,
          refreshExpiresAt: data.refreshExpiresAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });

        return { ok: true };
      },
    }),

    signUp: defineAction({
      accept: 'form',
      input: z.object({
        email: z.string().email(),
        username: z.string().min(3).max(50),
        password: z.string().min(4).max(255),
      }),
      handler: async (input, context) => {
        const data = await fetchGo<AuthSession>('/api/auth/signUp', {
          body: {
            user: {
              email: input.email,
              username: input.username,
              password: input.password,
            },
            session_data: getSessionData(context),
          },
        });

        context.session!.set('auth', {
          userId: data.userId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          status: data.status,
          type: data.type,
          device: data.device,
          agent: data.agent,
          ip: data.ip,
          accessExpiresAt: data.accessExpiresAt,
          refreshExpiresAt: data.refreshExpiresAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });

        return { ok: true };
      },
    }),

    signOut: defineAction({
      accept: 'form',
      handler: async (_, context) => {
        const auth = await context.session!.get<AuthSession>('auth');
        if (!auth) {
          throw new ActionError({ code: 'UNAUTHORIZED', message: 'No session' });
        }

        await fetchGo('/api/auth/signOut', {
          token: auth.accessToken,
          body: getSessionData(context),
        });

        context.session!.destroy();
        return { ok: true };
      },
    }),

    refresh: defineAction({
      accept: 'json',
      handler: async (_, context) => {
        const auth = await context.session!.get<AuthSession>('auth');
        if (!auth) {
          throw new ActionError({ code: 'UNAUTHORIZED', message: 'No session' });
        }

        const data = await fetchGo<AuthSession>('/api/auth/refresh', {
          token: auth.accessToken,
          body: getSessionData(context),
        });

        context.session!.set('auth', {
          userId: data.userId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          status: data.status,
          type: data.type,
          device: data.device,
          agent: data.agent,
          ip: data.ip,
          accessExpiresAt: data.accessExpiresAt,
          refreshExpiresAt: data.refreshExpiresAt,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });

        return { ok: true };
      },
    }),

    ping: defineAction({
      accept: 'json',
      handler: async (_, context) => {
        const auth = await context.session!.get<AuthSession>('auth');
        if (!auth) return { ok: false };

        const res = await fetch(`${API_BASE_URL}/api/auth/ping`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });

        if (!res.ok) {
          context.session!.destroy();
          return { ok: false };
        }

        return { ok: true };
      },
    }),
  },
};

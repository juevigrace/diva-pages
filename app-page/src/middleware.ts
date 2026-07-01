import { defineMiddleware } from 'astro:middleware';

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

declare global {
  namespace App {
    interface SessionData {
      auth: AuthSession;
    }
    interface Locals {
      session?: {
        userId: string;
        accessToken: string;
        status: string;
        type: string;
      } | null;
    }
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.session) {
    const auth = await context.session.get<AuthSession>('auth');
    if (auth) {
      context.locals.session = {
        userId: auth.userId,
        accessToken: auth.accessToken,
        status: auth.status,
        type: auth.type,
      };
    }
  }
  return next();
});

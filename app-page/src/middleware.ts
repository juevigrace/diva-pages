import { defineMiddleware } from 'astro:middleware';
import type { Session } from 'diva-types';

declare global {
  namespace App {
    interface SessionData {
      auth: Session;
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
    const auth = await context.session.get<Session>('auth');
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

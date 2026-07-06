import { defineMiddleware } from 'astro:middleware';
import type { SessionResponse } from 'diva-types/auth/responses';

declare global {
  namespace App {
    interface SessionData {
      auth?: SessionResponse;
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

const publicRoutes = [
  '/home',
  '/signIn',
  '/signUp',
  '/about',
  '/contact',
  '/pricing',
  '/docs',
  '/api',
  '/_astro',
  '/robots.txt',
  '/404',
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.session) {
    const auth = await context.session.get<SessionResponse>('auth');
    if (auth) {
      context.locals.session = {
        userId: auth.user_id,
        accessToken: auth.access_token,
        status: auth.status,
        type: auth.type,
      };
    }
  }

  const { pathname } = context.url;

  if (
    context.request.method === 'GET' &&
    !isPublicRoute(pathname) &&
    !context.locals.session
  ) {
    return context.redirect('/home');
  }

  return next();
});

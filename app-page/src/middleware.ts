import { defineMiddleware } from 'astro:middleware';
import { actions } from 'astro:actions';
import { API_BASE_URL } from 'astro:env/server';
import type { SessionResponse } from 'diva-types/auth/responses';

declare global {
  namespace App {
    interface SessionData {
      auth?: SessionResponse;
    }
    interface Locals {
      session?: {
        userId: string;
        sessionId: string;
        accessToken: string;
        status: string;
        type: string;
        role: string;
        isVerified: boolean;
      } | null;
      lang: string;
    }
  }
}

const publicRoutes = [
  '/home',
  '/signIn',
  '/signUp',
  '/verify',
  '/forgot-password',
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

const adminRoutes = ['/admin/permissions', '/admin/health', '/admin/api'];

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

async function fetchUserRole(userId: string, token: string): Promise<{ role: string; isVerified: boolean }> {
  const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Unauthorized');
  const json = await res.json();
  const data = json?.data;
  return {
    role: data?.role || 'USER',
    isVerified: data?.state?.verified ?? false,
  };
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.session) {
    let auth = await context.session.get<SessionResponse | null>('auth');

	if (auth) {
	  try {
	    const pingResult = await context.callAction(actions.auth.ping, {});
	    if (!pingResult.data?.ok) {
	      try {
	        const { data: refreshed } = await context.callAction(actions.auth.refresh, {});
	        auth = refreshed;
	      } catch {
	        await context.session?.set('auth', undefined);
	        auth = null;
	      }
	    }
	  } catch {
	    await context.session?.set('auth', undefined);
	    auth = null;
	  }
	}

    if (auth) {
      try {
        const { role, isVerified } = await fetchUserRole(auth.user_id, auth.access_token);
        context.locals.session = {
          userId: auth.user_id,
          sessionId: auth.session_id,
          accessToken: auth.access_token,
          status: auth.status,
          type: auth.type,
          role,
          isVerified,
        };
      } catch {
        await context.session?.set('auth', undefined);
      }
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

  if (
    context.locals.session &&
    isAdminRoute(pathname) &&
    context.locals.session.role !== 'ADMIN' &&
    context.locals.session.role !== 'MODERATOR'
  ) {
    return context.redirect('/home');
  }

  const acceptLang = context.request.headers.get('accept-language') || '';
  const preferredLang = acceptLang.split(',')[0]?.split('-')[0] || 'en';
  context.locals.lang = preferredLang === 'es' ? 'es' : 'en';

  return next();
});

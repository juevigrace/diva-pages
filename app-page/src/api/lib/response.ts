import { actions } from 'astro:actions';
import type { APIContext } from 'astro';
import type { SessionResponse } from 'diva-types/auth/responses';
import type { APIResponse } from 'diva-types/common/api-response';

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function requireSession(context: APIContext): Promise<SessionResponse> {
  const { data: session, error } = await context.callAction(actions.session.getSession, {});
  if (error || !session) {
    throw new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return session;
}

export function apiRoute(handler: (ctx: APIContext, session: SessionResponse) => Promise<Response>) {
  return async (ctx: APIContext): Promise<Response> => {
    try {
      const session = await requireSession(ctx);
      return await handler(ctx, session);
    } catch (e) {
      if (e instanceof Response) return e;
      return json({ message: `${e}` }, 500);
    }
  };
}

export function jsonResponse(res: { ok: boolean; status: number; json: APIResponse<unknown> }) {
  if (!res.ok) return json(res.json, res.status);
  return json(res.json.data ?? null, res.status);
}

export function nullResponse(res: { ok: boolean; status: number; json: unknown }) {
  if (!res.ok) return json(res.json, res.status);
  return new Response(null, { status: res.status });
}

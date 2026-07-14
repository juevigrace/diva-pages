import { actions } from 'astro:actions';
import type { APIContext } from 'astro';
import type { SessionResponse } from 'diva-types/auth/responses';

type SessionResult =
  | { ok: true; session: SessionResponse }
  | { ok: false; error: Response };

export async function requireSession(context: APIContext): Promise<SessionResult> {
  const { data: session, error } = await context.callAction(actions.session.getSession, {});
  if (error || !session) {
    return {
      ok: false,
      error: new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { ok: true, session };
}

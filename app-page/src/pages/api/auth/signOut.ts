import type { APIContext } from 'astro';
import { actions } from 'astro:actions';
import { requireSession } from '@api/lib/guard';
import { apiPost } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function POST(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    const body = await context.request.json();
    const res = await apiPost('/api/auth/signOut', body, session.access_token);
    await context.callAction(actions.session.deleteSession, {});
    return nullResponse(res);
  } catch (e) {
    return apiError(e);
  }
}

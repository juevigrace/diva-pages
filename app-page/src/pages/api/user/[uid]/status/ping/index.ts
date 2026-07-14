import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiPost } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function POST(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPost(`/api/user/${context.params.uid}/status/ping`, {}, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

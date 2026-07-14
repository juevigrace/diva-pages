import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { SessionResponse } from 'diva-types/auth/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<SessionResponse[]>(await apiGet(`/api/user/${context.params.uid}/sessions`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

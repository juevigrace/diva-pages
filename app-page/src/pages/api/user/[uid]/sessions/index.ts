import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { SessionResponse } from 'diva-types/auth/responses';

export async function GET({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<SessionResponse[]>(await apiGet(`/api/user/${params.uid}/sessions`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

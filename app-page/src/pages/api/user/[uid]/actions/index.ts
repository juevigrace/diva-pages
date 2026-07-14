import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { UserActionResponse } from 'diva-types/user/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserActionResponse[]>(await apiGet(`/api/user/${context.params.uid}/actions/`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

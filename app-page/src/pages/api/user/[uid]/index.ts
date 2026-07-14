import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiDelete } from '@api/lib/fetch';
import { dataResponse, nullResponse, apiError } from '@api/lib/response';
import type { UserResponse } from 'diva-types/user/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserResponse>(await apiGet(`/api/user/${context.params.uid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiDelete(`/api/user/${context.params.uid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

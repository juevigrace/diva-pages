import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiPatch } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function PATCH(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPatch(`/api/permissions/${context.params.pid}/restore`, {}, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

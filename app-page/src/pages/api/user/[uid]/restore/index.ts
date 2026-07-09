import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiPatch } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function PATCH({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPatch(`/api/user/${params.uid}/restore`, {}, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

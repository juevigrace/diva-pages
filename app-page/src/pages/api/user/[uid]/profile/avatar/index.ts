import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiUpload } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function PATCH({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    const formData = await request.formData();
    return nullResponse(await apiUpload(`/api/user/${params.uid}/profile/avatar`, formData, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

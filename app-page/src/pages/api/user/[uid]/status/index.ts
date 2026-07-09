import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiPut } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function PUT({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPut(`/api/user/${params.uid}/status`, await request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

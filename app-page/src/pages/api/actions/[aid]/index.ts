import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiDelete } from '@api/lib/fetch';
import { dataResponse, nullResponse, apiError } from '@api/lib/response';

export async function GET({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse(await apiGet(`/api/actions/${params.aid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiDelete(`/api/actions/${params.aid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

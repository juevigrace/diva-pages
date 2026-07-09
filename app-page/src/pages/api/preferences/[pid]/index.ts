import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPut } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { UserPreferencesResponse } from 'diva-types/user/responses';

export async function GET({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserPreferencesResponse>(await apiGet(`/api/preferences/${params.pid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserPreferencesResponse>(await apiPut(`/api/preferences/${params.pid}`, await request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

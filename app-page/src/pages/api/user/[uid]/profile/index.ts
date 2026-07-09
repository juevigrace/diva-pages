import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPost, apiPut } from '@api/lib/fetch';
import { dataResponse, nullResponse, apiError } from '@api/lib/response';
import type { UserProfileResponse } from 'diva-types/user/responses';

export async function GET({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserProfileResponse>(await apiGet(`/api/user/${params.uid}/profile`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPost(`/api/user/${params.uid}/profile`, await request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPut(`/api/user/${params.uid}/profile`, await request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

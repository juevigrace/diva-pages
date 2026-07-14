import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPost, apiPut } from '@api/lib/fetch';
import { dataResponse, nullResponse, apiError } from '@api/lib/response';
import type { UserProfileResponse } from 'diva-types/user/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserProfileResponse>(await apiGet(`/api/user/${context.params.uid}/profile`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPost(`/api/user/${context.params.uid}/profile`, await context.request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPut(`/api/user/${context.params.uid}/profile`, await context.request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

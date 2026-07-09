import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPut, apiDelete } from '@api/lib/fetch';
import { dataResponse, nullResponse, apiError } from '@api/lib/response';
import type { UserPermissionResponse } from 'diva-types/user/responses';

export async function GET({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserPermissionResponse>(await apiGet(`/api/user/${params.uid}/permissions/${params.pid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserPermissionResponse>(await apiPut(`/api/user/${params.uid}/permissions/${params.pid}`, await request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiDelete(`/api/user/${params.uid}/permissions/${params.pid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

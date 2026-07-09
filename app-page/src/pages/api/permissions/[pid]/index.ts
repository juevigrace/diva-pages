import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPut, apiDelete } from '@api/lib/fetch';
import { dataResponse, nullResponse, apiError } from '@api/lib/response';
import type { PermissionResponse } from 'diva-types/permission/responses';

export async function GET({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<PermissionResponse>(await apiGet(`/api/permissions/${params.pid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<PermissionResponse>(await apiPut(`/api/permissions/${params.pid}`, await request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE({ params, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiDelete(`/api/permissions/${params.pid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

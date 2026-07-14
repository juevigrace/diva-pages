import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPut, apiDelete } from '@api/lib/fetch';
import { dataResponse, nullResponse, apiError } from '@api/lib/response';
import type { PermissionResponse } from 'diva-types/permission/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<PermissionResponse>(await apiGet(`/api/permissions/${context.params.pid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function PUT(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<PermissionResponse>(await apiPut(`/api/permissions/${context.params.pid}`, await context.request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiDelete(`/api/permissions/${context.params.pid}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

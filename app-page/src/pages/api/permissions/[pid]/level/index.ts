import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiPatch } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { PermissionResponse } from 'diva-types/permission/responses';

export async function PATCH(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<PermissionResponse>(await apiPatch(`/api/permissions/${context.params.pid}/level`, await context.request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

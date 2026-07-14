import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPost } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { UserPermissionResponse } from 'diva-types/user/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserPermissionResponse[]>(await apiGet(`/api/user/${context.params.uid}/permissions/`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<UserPermissionResponse>(await apiPost(`/api/user/${context.params.uid}/permissions/`, await context.request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

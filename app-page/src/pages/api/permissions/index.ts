import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPost } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { PaginatedResponse } from 'diva-types/common/api-response';
import type { PermissionResponse } from 'diva-types/permission/responses';

export async function GET({ callAction, url }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '50';
    return dataResponse<PaginatedResponse<PermissionResponse>>(await apiGet(`/api/permissions/?page=${page}&limit=${limit}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST({ request, callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return dataResponse<PermissionResponse>(await apiPost(`/api/permissions/`, await request.json(), session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

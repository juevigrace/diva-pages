import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';
import type { PaginatedResponse } from 'diva-types/common/api-response';
import type { PermissionResponse } from 'diva-types/permission/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    const page = context.url.searchParams.get('page') || '1';
    const limit = context.url.searchParams.get('limit') || '50';
    return dataResponse<PaginatedResponse<PermissionResponse>>(await apiGet(`/api/permissions/?page=${page}&limit=${limit}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiGet, apiPost } from '@api/lib/fetch';
import { json, dataResponse, nullResponse, apiError } from '@api/lib/response';
import { signUpInputSchema } from '@lib/schemas/auth';
import type { PaginatedResponse } from 'diva-types/common/api-response';
import type { UserResponse } from 'diva-types/user/responses';

export async function GET(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    const page = context.url.searchParams.get('page') || '1';
    const limit = context.url.searchParams.get('limit') || '50';
    return dataResponse<PaginatedResponse<UserResponse>>(await apiGet(`/api/user/?page=${page}&limit=${limit}`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(context: APIContext): Promise<Response> {
  try {
    const body = await context.request.json();
    const parsed = signUpInputSchema.safeParse(body);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      const message = Object.values(fields).flat().join('. ');
      return json({ message: message || 'Validation failed', fields }, 400);
    }
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiPost(`/api/user/`, parsed.data, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

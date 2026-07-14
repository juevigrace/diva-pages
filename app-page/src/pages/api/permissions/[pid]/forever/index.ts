import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiDelete } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function DELETE(context: APIContext): Promise<Response> {
  try {
    const result = await requireSession(context);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiDelete(`/api/permissions/${context.params.pid}/forever`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

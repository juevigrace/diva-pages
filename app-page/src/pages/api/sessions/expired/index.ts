import type { APIContext } from 'astro';
import { requireSession } from '@api/lib/guard';
import { apiDelete } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function DELETE({ callAction }: APIContext): Promise<Response> {
  try {
    const result = await requireSession(callAction);
    if (!result.ok) return result.error;
    const { session } = result;
    return nullResponse(await apiDelete(`/api/sessions/expired`, session.access_token));
  } catch (e) {
    return apiError(e);
  }
}

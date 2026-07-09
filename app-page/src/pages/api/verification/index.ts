import type { APIContext } from 'astro';
import { apiPost } from '@api/lib/fetch';
import { nullResponse, apiError } from '@api/lib/response';

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    return nullResponse(await apiPost('/api/verification/', await request.json()));
  } catch (e) {
    return apiError(e);
  }
}

import type { APIContext } from 'astro';
import { apiPost } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    return dataResponse(await apiPost('/api/verification/request', await request.json()));
  } catch (e) {
    return apiError(e);
  }
}

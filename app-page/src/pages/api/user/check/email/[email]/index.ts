import type { APIContext } from 'astro';
import { apiGet } from '@api/lib/fetch';
import { dataResponse, apiError } from '@api/lib/response';

export async function GET({ params }: APIContext): Promise<Response> {
  try {
    return dataResponse(await apiGet(`/api/user/check/email/${params.email}`));
  } catch (e) {
    return apiError(e);
  }
}

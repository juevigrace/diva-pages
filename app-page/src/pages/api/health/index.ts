import { apiRoute, jsonResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const GET = apiRoute(async (ctx, session) => {
  return jsonResponse(await apiFetch('/health', { token: session.access_token }));
});

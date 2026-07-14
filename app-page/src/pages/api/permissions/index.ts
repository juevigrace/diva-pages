import { apiRoute, jsonResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const GET = apiRoute(async (ctx, session) => {
  const page = ctx.url.searchParams.get('page') || '1';
  const limit = ctx.url.searchParams.get('limit') || '50';
  return jsonResponse(await apiFetch(`/api/permissions/?page=${page}&limit=${limit}`, { token: session.access_token }));
});

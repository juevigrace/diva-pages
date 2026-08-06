import { apiRoute, jsonResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const GET = apiRoute(async (ctx, session) => {
  const page = ctx.url.searchParams.get('page') || '1';
  const limit = ctx.url.searchParams.get('limit') || '20';
  return jsonResponse(await apiFetch(`/api/endpoint-permissions/?page=${page}&limit=${limit}`, { token: session.access_token }));
});

export const POST = apiRoute(async (ctx, session) => {
  return jsonResponse(await apiFetch(`/api/endpoint-permissions/`, { method: 'POST', body: await ctx.request.json(), token: session.access_token }));
});

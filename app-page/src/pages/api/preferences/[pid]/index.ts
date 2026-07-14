import { apiRoute, jsonResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const GET = apiRoute(async (ctx, session) => {
  return jsonResponse(await apiFetch(`/api/preferences/${ctx.params.pid}`, { token: session.access_token }));
});

export const PUT = apiRoute(async (ctx, session) => {
  return jsonResponse(await apiFetch(`/api/preferences/${ctx.params.pid}`, { method: 'PUT', body: await ctx.request.json(), token: session.access_token }));
});

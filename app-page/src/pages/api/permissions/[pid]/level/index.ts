import { apiRoute, jsonResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const PATCH = apiRoute(async (ctx, session) => {
  return jsonResponse(await apiFetch(`/api/permissions/${ctx.params.pid}/level`, { method: 'PATCH', body: await ctx.request.json(), token: session.access_token }));
});

import { apiRoute, nullResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const PUT = apiRoute(async (ctx, session) => {
  return nullResponse(await apiFetch(`/api/user/${ctx.params.uid}/status`, { method: 'PUT', body: await ctx.request.json(), token: session.access_token }));
});

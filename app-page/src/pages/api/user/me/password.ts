import { apiRoute, nullResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const PATCH = apiRoute(async (ctx, session) => {
  return nullResponse(await apiFetch(`/api/user/${session.user_id}/password`, { method: 'PATCH', body: await ctx.request.json(), token: session.access_token }));
});

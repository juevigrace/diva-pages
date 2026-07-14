import { apiRoute, nullResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const POST = apiRoute(async (ctx, session) => {
  return nullResponse(await apiFetch(`/api/user/${ctx.params.uid}/status/ping`, { method: 'POST', body: {}, token: session.access_token }));
});

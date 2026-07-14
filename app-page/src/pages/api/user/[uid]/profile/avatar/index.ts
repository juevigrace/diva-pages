import { apiRoute, nullResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const PATCH = apiRoute(async (ctx, session) => {
  return nullResponse(await apiFetch(`/api/user/${ctx.params.uid}/profile/avatar`, { method: 'PATCH', formData: await ctx.request.formData(), token: session.access_token }));
});

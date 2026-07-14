import { apiRoute, nullResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const DELETE = apiRoute(async (ctx, session) => {
  return nullResponse(await apiFetch(`/api/sessions/expired`, { method: 'DELETE', token: session.access_token }));
});

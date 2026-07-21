import { apiRoute, jsonResponse, nullResponse } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';
import { actions } from 'astro:actions';

export const GET = apiRoute(async (ctx, session) => {
  return jsonResponse(await apiFetch(`/api/sessions/${ctx.params.sid}`, { token: session.access_token }));
});

export const DELETE = apiRoute(async (ctx, session) => {
  const res = await apiFetch(`/api/sessions/${ctx.params.sid}`, { method: 'DELETE', token: session.access_token });
  if (res.ok && ctx.params.sid === session.session_id) {
    await ctx.callAction(actions.server.session.deleteSession, {});
  }
  return nullResponse(res);
});

import { actions } from 'astro:actions';
import { apiRoute, json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';
import { getDeviceLabel } from '@lib/device';

export const POST = apiRoute(async (ctx, session) => {
  const body = await ctx.request.json();
  const res = await apiFetch('/api/auth/signOut', {
    method: 'POST',
    body: {
      ...body,
      device: body.device || getDeviceLabel(session.agent),
      user_agent: body.user_agent || session.agent,
    },
    token: session.access_token,
  });
  const { data } = await ctx.callAction(actions.session.deleteSession, {});
  const remaining = data?.remaining ?? 0;
  if (!res.ok) return json({ ...(res.json as object), remaining }, res.status);
  return json({ remaining }, res.status);
});

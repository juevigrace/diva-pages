import { actions } from 'astro:actions';
import { apiRoute, json } from '@api/lib/response';

export const POST = apiRoute(async (ctx) => {
  const body = await ctx.request.json();
  const { error } = await ctx.callAction(actions.session.switchAccount, { user_id: body.user_id });
  if (error) {
    const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'FORBIDDEN' ? 403 : 400;
    return json({ message: error.message || 'Failed to switch account' }, status);
  }
  return json({ ok: true });
});

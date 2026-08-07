import { actions } from 'astro:actions';
import { apiRoute, json } from '@api/lib/response';

export const POST = apiRoute(async (ctx) => {
  const { data } = await ctx.callAction(actions.session.signOutAll, {});
  return json({ closed: data?.closed ?? 0 });
});

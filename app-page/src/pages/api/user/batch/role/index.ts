import { apiRoute, json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';

export const POST = apiRoute(async (ctx, session) => {
  const { user_ids, role } = await ctx.request.json();
  if (!Array.isArray(user_ids) || user_ids.length === 0) {
    return json({ message: 'user_ids must be a non-empty array' }, 400);
  }
  if (!role) {
    return json({ message: 'role is required' }, 400);
  }

  const results = await Promise.allSettled(
    user_ids.map((uid: string) =>
      apiFetch(`/api/user/${uid}/role`, {
        method: 'PATCH',
        body: { role },
        token: session.access_token,
      }),
    ),
  );

  const succeeded: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled' && r.value.ok) {
      succeeded.push(user_ids[i]);
    } else {
      const msg = r.status === 'fulfilled' ? r.value.json.message || 'request failed' : r.reason?.message || 'unknown error';
      failed.push({ id: user_ids[i], error: msg });
    }
  }

  return json({ succeeded, failed });
});

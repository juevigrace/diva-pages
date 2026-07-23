import { apiRoute, jsonResponse, nullResponse, json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';
import { signUpInputSchema } from '@lib/schemas/auth';

export const GET = apiRoute(async (ctx, session) => {
  const page = ctx.url.searchParams.get('page') || '1';
  const limit = ctx.url.searchParams.get('limit') || '50';
  const deletedExcluded = ctx.url.searchParams.get('deleted') === 'false';

  const res = await apiFetch(`/api/user/?page=${page}&limit=${limit}`, { token: session.access_token });

  if (!res.ok) return jsonResponse(res);

  if (deletedExcluded && res.json.data) {
    const data = res.json.data as Record<string, any>;
    const items = (data.items || []).filter((u: any) => !u.deleted_at);
    const pageLimit = parseInt(limit);
    data.items = items;
    data.pagination_info = {
      ...data.pagination_info,
      total_items: items.length,
      total_pages: Math.ceil(items.length / pageLimit) || 1,
    };
    return json(data, res.status);
  }

  return jsonResponse(res);
});

export const POST = apiRoute(async (ctx, session) => {
  const body = await ctx.request.json();
  const parsed = signUpInputSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    const message = Object.values(fields).flat().join('. ');
    return json({ message: message || 'Validation failed', fields }, 400);
  }
  return nullResponse(await apiFetch(`/api/user/`, { method: 'POST', body: parsed.data, token: session.access_token }));
});

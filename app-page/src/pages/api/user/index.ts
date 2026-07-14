import { apiRoute, jsonResponse, nullResponse, json } from '@api/lib/response';
import { apiFetch } from '@api/lib/fetch';
import { signUpInputSchema } from '@lib/schemas/auth';

export const GET = apiRoute(async (ctx, session) => {
  const page = ctx.url.searchParams.get('page') || '1';
  const limit = ctx.url.searchParams.get('limit') || '50';
  return jsonResponse(await apiFetch(`/api/user/?page=${page}&limit=${limit}`, { token: session.access_token }));
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

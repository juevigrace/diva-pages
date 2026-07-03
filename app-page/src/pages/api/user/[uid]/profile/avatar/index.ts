import type { APIContext } from 'astro';
import { actions } from 'astro:actions';
import { API_BASE_URL } from 'astro:env/server';
import type { APIResponse } from 'diva-types/common/api-response';

export async function PATCH({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const { data: session, error } = await callAction(actions.session.getSession, {});
    if (error || !session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();

    const res = await fetch(`${API_BASE_URL}/api/user/${params.uid}/profile/avatar`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    const json: APIResponse<unknown> = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify(json), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(null, { status: res.status });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

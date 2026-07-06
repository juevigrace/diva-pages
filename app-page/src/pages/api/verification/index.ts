import type { APIContext } from 'astro';
import { API_BASE_URL } from 'astro:env/server';
import type { APIResponse } from 'diva-types/common/api-response';
import type { VerifyActionDto } from 'diva-types/verification/dtos';

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    const body: VerifyActionDto = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/verification/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json: APIResponse<unknown> = await res.json();
    if (!res.ok) return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    return new Response(null, { status: res.status });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

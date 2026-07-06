import type { APIContext } from 'astro';
import { API_BASE_URL } from 'astro:env/server';
import type { APIResponse } from 'diva-types/common/api-response';
import type { RequestActionVerificationDto } from 'diva-types/verification/dtos';

export async function POST({ request }: APIContext): Promise<Response> {
  try {
    const body: RequestActionVerificationDto = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/verification/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json: APIResponse<unknown> = await res.json();
    if (!res.ok) return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(json.data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

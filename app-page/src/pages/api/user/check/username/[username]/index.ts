import type { APIContext } from 'astro';
import { API_BASE_URL } from 'astro:env/server';

export async function GET({ params }: APIContext): Promise<Response> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/user/check/username/${params.username}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const json = await res.json();

    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

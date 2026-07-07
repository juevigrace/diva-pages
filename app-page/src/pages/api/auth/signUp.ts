import type { APIContext } from 'astro';
import { actions } from 'astro:actions';

import { API_BASE_URL } from 'astro:env/server';
import { signUpInputSchema } from '@lib/schemas/auth';
import type { APIResponse } from 'diva-types/common/api-response';
import type { SessionResponse } from 'diva-types/auth/responses';
import type { SignUpDto } from 'diva-types/auth/dtos';

export async function POST({ request, callAction }: APIContext): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown>;
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const fd = await request.formData();
      body = Object.fromEntries(fd.entries());
    }

    const parsed = signUpInputSchema.safeParse(body);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      const message = Object.values(fields).flat().join('. ');
      const isHtmx = request.headers.get('HX-Request') === 'true';
      if (isHtmx) {
        return new Response(null, {
          status: 200,
          headers: {
            'HX-Trigger': JSON.stringify({ showToast: { type: 'error', message: message || 'Validation failed' } }),
          },
        });
      }
      return new Response(JSON.stringify({ message: message || 'Validation failed', fields }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const dto: SignUpDto = {
      user: {
        email: parsed.data.email,
        username: parsed.data.username,
        password: parsed.data.password,
      },
      session_data: {
        device: parsed.data.device || 'web',
        user_agent: request.headers.get('User-Agent') || 'web',
      },
    };

    const res = await fetch(`${API_BASE_URL}/api/auth/signUp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    const json: APIResponse<SessionResponse> = await res.json();

    if (!res.ok) {
      const isHtmx = request.headers.get('HX-Request') === 'true';
      if (isHtmx) {
        return new Response(null, {
          status: 200,
          headers: {
            'HX-Trigger': JSON.stringify({ showToast: { type: 'error', message: json.message || 'An error occurred' } }),
          },
        });
      }
      return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }

    await callAction(actions.session.saveSession, json.data);

    const isHtmx = request.headers.get('HX-Request') === 'true';
    if (isHtmx) {
      return new Response(null, { status: 200, headers: { 'HX-Redirect': '/' } });
    }

    return new Response(JSON.stringify(json.data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    const body = { message: `${e}` };
    return new Response(JSON.stringify(body), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

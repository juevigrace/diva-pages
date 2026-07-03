import type { APIContext } from 'astro';
import { actions } from 'astro:actions';

import { API_BASE_URL } from 'astro:env/server';
import { forgotPasswordConfirmSchema } from '@lib/schemas/auth';
import type { APIResponse } from 'diva-types/common/api-response';
import type { SessionResponse } from 'diva-types/auth/responses';
import type { ForgotPasswordConfirmDto } from 'diva-types/auth/dtos';

export async function POST({ request, callAction }: APIContext): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = forgotPasswordConfirmSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({
        message: 'Validation failed',
        fields: parsed.error.flatten().fieldErrors,
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const dto: ForgotPasswordConfirmDto = {
      id: parsed.data.id,
      session_data: {
        device: parsed.data.device || 'web',
        user_agent: request.headers.get('User-Agent') || 'web',
      },
    };

    const res = await fetch(`${API_BASE_URL}/api/auth/forgot/password/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });

    const json: APIResponse<SessionResponse> = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify(json), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await callAction(actions.session.saveSession, json.data);

    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const body = { message: `${e}` };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

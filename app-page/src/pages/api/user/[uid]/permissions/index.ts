import type { APIContext } from 'astro';
import { actions } from 'astro:actions';
import { API_BASE_URL } from 'astro:env/server';
import type { APIResponse } from 'diva-types/common/api-response';
import type { UserPermissionResponse } from 'diva-types/user/responses';
import type { CreateUserPermissionDto } from 'diva-types/user/dtos';

export async function GET({ params, callAction }: APIContext): Promise<Response> {
  try {
    const { data: session, error } = await callAction(actions.session.getSession, {});
    if (error || !session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const res = await fetch(`${API_BASE_URL}/api/user/${params.uid}/permissions/`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    });
    const json: APIResponse<UserPermissionResponse[]> = await res.json();
    if (!res.ok) return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(json.data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST({ params, request, callAction }: APIContext): Promise<Response> {
  try {
    const { data: session, error } = await callAction(actions.session.getSession, {});
    if (error || !session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const body: CreateUserPermissionDto = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/user/${params.uid}/permissions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    });
    const json: APIResponse<UserPermissionResponse> = await res.json();
    if (!res.ok) return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(json.data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

import type { APIContext } from 'astro';
import { actions } from 'astro:actions';
import { API_BASE_URL } from 'astro:env/server';
import type { APIResponse, PaginatedResponse } from 'diva-types/common/api-response';
import type { PermissionResponse } from 'diva-types/permission/responses';
import type { CreatePermissionDto } from 'diva-types/permission/dtos';

export async function GET({ callAction, url }: APIContext): Promise<Response> {
  try {
    const { data: session, error } = await callAction(actions.session.getSession, {});
    if (error || !session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '50';
    const res = await fetch(`${API_BASE_URL}/api/permissions/?page=${page}&limit=${limit}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    });
    const json: APIResponse<PaginatedResponse<PermissionResponse>> = await res.json();
    if (!res.ok) return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(json.data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST({ request, callAction }: APIContext): Promise<Response> {
  try {
    const { data: session, error } = await callAction(actions.session.getSession, {});
    if (error || !session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const body: CreatePermissionDto = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/permissions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    });
    const json: APIResponse<PermissionResponse> = await res.json();
    if (!res.ok) return new Response(JSON.stringify(json), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify(json.data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ message: `${e}` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

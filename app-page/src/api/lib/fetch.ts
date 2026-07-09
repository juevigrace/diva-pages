import { API_BASE_URL } from 'astro:env/server';
import type { APIResponse } from 'diva-types/common/api-response';

interface FetchOptions {
  method?: string;
  body?: unknown;
  token?: string;
  formData?: FormData;
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<{ status: number; ok: boolean; json: APIResponse<T> }> {
  const headers: Record<string, string> = {};
  if (!options.formData) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  const init: RequestInit = { method: options.method || 'GET', headers };
  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }
  if (options.formData) {
    init.body = options.formData;
  }
  const res = await fetch(`${API_BASE_URL}${endpoint}`, init);
  const text = await res.text();
  const json = text ? (JSON.parse(text) as APIResponse<T>) : ({} as APIResponse<T>);
  return { status: res.status, ok: res.ok, json };
}

export function apiGet<T = unknown>(endpoint: string, token?: string) {
  return apiFetch<T>(endpoint, { token });
}

export function apiPost<T = unknown>(endpoint: string, body?: unknown, token?: string) {
  return apiFetch<T>(endpoint, { method: 'POST', body, token });
}

export function apiPut<T = unknown>(endpoint: string, body?: unknown, token?: string) {
  return apiFetch<T>(endpoint, { method: 'PUT', body, token });
}

export function apiPatch<T = unknown>(endpoint: string, body?: unknown, token?: string) {
  return apiFetch<T>(endpoint, { method: 'PATCH', body, token });
}

export function apiDelete<T = unknown>(endpoint: string, token?: string) {
  return apiFetch<T>(endpoint, { method: 'DELETE', token });
}

export function apiUpload<T = unknown>(endpoint: string, formData: FormData, token?: string) {
  return apiFetch<T>(endpoint, { method: 'PATCH', formData, token });
}

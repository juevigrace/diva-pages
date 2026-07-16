import { apiFetch } from './fetch';

export async function fetchCurrentUser(uid: string, token: string): Promise<{ user: Record<string, any> | null; isVerified: boolean }> {
  try {
    const res = await apiFetch(`/api/user/${uid}`, { token });
    if (res.ok) {
      const user = res.json.data;
      return { user, isVerified: user?.state?.verified ?? false };
    }
  } catch {}
  return { user: null, isVerified: false };
}

export type SessionResponse = {
  session_id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  status: string;
  type: string;
  device: string;
  ip: string;
  agent: string;
  access_expires_at: number;
  refresh_expires_at: number;
  created_at: number;
  updated_at: number;
};

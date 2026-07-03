export interface UserStateResponse {
  verified: boolean;
  status: string;
  last_active_at: number;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  role: string;
  state: UserStateResponse | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

export interface UserProfileResponse {
  first_name: string;
  last_name: string;
  birth_date: number;
  phone_number: string;
  alias: string;
  avatar: string;
  bio: string;
}

export interface UserPermissionResponse {
  permission_id: string;
  granted_by: string | null;
  granted: boolean;
  granted_at: number;
  expires_at: number | null;
  updated_at: number;
}

export interface UserPreferencesResponse {
  id: string;
  theme: string;
  onboarding_completed: boolean;
  language: string;
  last_sync_at: number;
  created_at: number;
  updated_at: number;
}

export interface UserActionResponse {
  id: string;
  action_name: string;
}

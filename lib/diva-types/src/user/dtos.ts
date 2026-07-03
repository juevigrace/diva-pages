export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
}

export interface CreateProfileDto {
  first_name: string;
  last_name: string;
  alias: string;
  bio?: string;
  birth_date: number;
}

export interface UpdateProfileDto {
  first_name: string;
  last_name: string;
  alias: string;
  bio?: string;
  birth_date: number;
}

export interface UpdateUsernameDto {
  username: string;
}

export interface UpdatePasswordDto {
  new_password: string;
}

export interface UpdatePhoneNumberDto {
  phone_number: string;
}

export interface UpdateEmailDto {
  email: string;
}

export interface UpdateRole {
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface UpdateVerified {
  verified: boolean;
}

export interface UpdateUserStatus {
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export interface CreateUserPermissionDto {
  permission_action: string;
  granted: boolean;
  expires_at?: number | null;
}

export interface UpdateUserPermissionDto {
  granted: boolean;
  expires_at?: number | null;
}

export interface CreateUserPreferencesDto {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  onboarding_completed: boolean;
  language: string;
}

export interface UpdateUserPreferencesDto {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  language: string;
}

import type { RoleType, UserStatusType, ThemeType } from '../common/enums';

export type CreateUserDto = {
  email: string;
  username: string;
  password: string;
};

export type CreateProfileDto = {
  first_name: string;
  last_name: string;
  alias: string;
  bio?: string;
  birth_date: number;
};

export type UpdateProfileDto = {
  first_name: string;
  last_name: string;
  alias: string;
  bio?: string;
  birth_date: number;
};

export type UpdateUsernameDto = {
  username: string;
};

export type UpdatePasswordDto = {
  new_password: string;
};

export type UpdatePhoneNumberDto = {
  phone_number: string;
};

export type UpdateEmailDto = {
  email: string;
};

export type UpdateRole = {
  role: RoleType;
};

export type UpdateVerified = {
  verified: boolean;
};

export type UpdateUserStatus = {
  status: UserStatusType;
};

export type CreateUserPermissionDto = {
  permission_action: string;
  granted: boolean;
  expires_at?: number | null;
};

export type UpdateUserPermissionDto = {
  granted: boolean;
  expires_at?: number | null;
};

export type CreateUserPreferencesDto = {
  theme: ThemeType;
  onboarding_completed: boolean;
  language: string;
};

export type UpdateUserPreferencesDto = {
  theme: ThemeType;
  language: string;
};

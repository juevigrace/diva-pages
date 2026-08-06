import type { Role } from '../../common/enums/role_enum';
import type { UserDevice } from '../../device/models/user_device';
import type { UserAction } from './user_action';
import type { UserPermission } from './user_permission';
import type { UserPreferences } from './user_preferences';
import type { UserProfile } from './user_profile';
import type { UserState } from './user_state';

export type User = {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  role: Role;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  state?: UserState | null;
  profile?: UserProfile | null;
  devices?: UserDevice[];
  actions?: UserAction[];
  permissions?: Record<string, UserPermission>;
  preferences?: UserPreferences | null;
};

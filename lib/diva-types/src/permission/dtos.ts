import type { RoleType } from '../common/enums';

export type CreatePermissionDto = {
  name: string;
  description: string;
  action: string;
  level: RoleType;
};

export type UpdatePermissionDto = {
  name: string;
  description: string;
};

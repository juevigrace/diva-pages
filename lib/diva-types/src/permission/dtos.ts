import type { RoleType } from '../common/enums';

export type UpdatePermissionDto = {
  name: string;
  description: string;
};

export type UpdatePermissionRoleLevelDto = {
  level: RoleType;
};

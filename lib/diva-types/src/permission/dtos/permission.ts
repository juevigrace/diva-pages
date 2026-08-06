import type { Role } from '../../common/enums/role_enum';

export type UpdatePermissionDto = {
  name: string;
  description: string;
};

export type UpdatePermissionRoleLevelDto = {
  level: Role;
};

export type UpdatePermissionDefaultDto = {
  is_default: boolean;
};

export type CreateEndpointPermissionDto = {
  method: string;
  path_pattern: string;
  permission_id: string;
};

export type UpdateEndpointPermissionDto = {
  method: string;
  path_pattern: string;
};

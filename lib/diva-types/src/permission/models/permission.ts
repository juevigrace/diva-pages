import type { Role } from '../../common/enums/role_enum';

export type Permission = {
  id: string;
  name: string;
  description: string;
  roleLevel: Role;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
};

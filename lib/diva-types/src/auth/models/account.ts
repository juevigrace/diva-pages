import type { Role } from '../../common/enums/role_enum';

export type AccountInfo = {
  userId: string;
  username: string;
  email: string;
  role: Role;
};

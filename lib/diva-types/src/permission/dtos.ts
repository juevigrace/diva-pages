export interface CreatePermissionDto {
  name: string;
  description: string;
  action: string;
  level: 'USER' | 'MODERATOR' | 'ADMIN';
}

export interface UpdatePermissionDto {
  name: string;
  description: string;
}

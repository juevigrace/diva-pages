export const RoleType = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;
export type RoleType = (typeof RoleType)[keyof typeof RoleType];

export const UserStatusType = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  INACTIVE: 'INACTIVE',
} as const;
export type UserStatusType = (typeof UserStatusType)[keyof typeof UserStatusType];

export const SessionStatusType = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CLOSED: 'CLOSED',
} as const;
export type SessionStatusType = (typeof SessionStatusType)[keyof typeof SessionStatusType];

export const SessionType = {
  NORMAL: 'NORMAL',
  TEMPORAL: 'TEMPORAL',
} as const;
export type SessionType = (typeof SessionType)[keyof typeof SessionType];

export const ThemeType = {
  LIGHT: 'LIGHT',
  DARK: 'DARK',
  SYSTEM: 'SYSTEM',
} as const;
export type ThemeType = (typeof ThemeType)[keyof typeof ThemeType];

export const MediaType = {
  AUDIO: 'AUDIO',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  UNSPECIFIED: 'UNSPECIFIED',
} as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

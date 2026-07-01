export type Session = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  status: string;
  type: string;
  device: string;
  agent: string;
  ip: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
  createdAt: number;
  updatedAt: number;
};

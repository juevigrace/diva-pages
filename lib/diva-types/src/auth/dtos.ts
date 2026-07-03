import type { CreateUserDto } from '../user/dtos';

export type SessionDataDto = {
  device: string;
  user_agent: string;
};

export type SignInDto = {
  username: string;
  password: string;
  session_data: SessionDataDto;
};

export type SignUpDto = {
  user: CreateUserDto;
  session_data: SessionDataDto;
};

export type ForgotPasswordConfirmDto = {
  id: string;
  session_data: SessionDataDto;
};

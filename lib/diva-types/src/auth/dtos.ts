export interface SessionDataDto {
  device: string;
  user_agent: string;
}

export interface SignInDto {
  username: string;
  password: string;
  session_data: SessionDataDto;
}

export interface SignUpDto {
  user: {
    email: string;
    username: string;
    password: string;
  };
  session_data: SessionDataDto;
}

export interface ForgotPasswordConfirmDto {
  id: string;
  session_data: SessionDataDto;
}

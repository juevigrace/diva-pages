export interface VerifyActionDto {
  action_id: string;
  token: string;
}

export interface RequestActionVerificationDto {
  email: string;
  action: string;
}

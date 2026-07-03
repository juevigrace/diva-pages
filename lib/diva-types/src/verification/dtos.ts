export type VerifyActionDto = {
  action_id: string;
  token: string;
};

export type RequestActionVerificationDto = {
  email: string;
  action: string;
};

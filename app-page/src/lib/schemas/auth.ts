import { z } from 'zod';

export const signInInputSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  device: z.string().optional(),
});

export const signUpInputSchema = z.object({
  email: z.email(),
  username: z.string().min(3),
  password: z.string().min(8),
  device: z.string().optional(),
});

export const forgotPasswordConfirmSchema = z.object({
  id: z.string().min(1),
  device: z.string().optional(),
});

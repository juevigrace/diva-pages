import { z } from 'zod';

export const signInInputSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(1000),
  device: z.string().optional(),
});

export const signUpInputSchema = z.object({
  email: z.email().max(100),
  username: z.string().min(3).max(50),
  password: z.string().min(4).max(255),
  device: z.string().optional(),
});

export const forgotPasswordConfirmSchema = z.object({
  id: z.uuid(),
  device: z.string().optional(),
});

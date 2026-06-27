import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  pin: z.string().length(4, 'PIN must be 4 digits').optional(),
}).refine(data => (data.email && data.password) || data.pin, {
  message: 'Either email/password or PIN must be provided',
  path: ['email'],
});

export type LoginInput = z.infer<typeof loginSchema>;

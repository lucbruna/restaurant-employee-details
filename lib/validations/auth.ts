import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Endereço de e-mail inválido').optional(),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional(),
  pin: z.string().length(4, 'O PIN deve ter 4 dígitos').optional(),
}).refine(data => (data.email && data.password) || data.pin, {
  message: 'Informe e-mail/senha ou PIN',
  path: ['email'],
});

export type LoginInput = z.infer<typeof loginSchema>;

import { z } from 'zod';

export const phoneNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Número de telemóvel inválido (formato E.164 exigido)');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A password deve ter pelo menos 8 caracteres'),
});

export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A password deve ter pelo menos 8 caracteres'),
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
});

export const createContactSchema = z.object({
  phoneNumber: phoneNumberSchema,
  name: z.string().optional(),
  email: z.string().email().optional(),
  notes: z.string().optional(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().cuid(),
  content: z.string().min(1),
  type: z.enum(['TEXT']).default('TEXT'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type CreateContactDto = z.infer<typeof createContactSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;

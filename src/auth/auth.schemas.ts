import { z } from 'zod'

export const loginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const authUserSchema = z.object({
  username: z.string(),
  role: z.string(),
})

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  user: authUserSchema,
})

export type LoginRequestInput = z.infer<typeof loginRequestSchema>

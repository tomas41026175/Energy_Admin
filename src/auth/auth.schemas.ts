import { z } from 'zod'

export const loginRequestSchema = z.object({
  username: z.string().min(1, '請輸入帳號'),
  password: z.string().min(6, '密碼至少需要 6 個字元'),
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

import { z } from 'zod'

export const userStatusSchema = z.enum(['active', 'inactive'])

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string(),
  status: userStatusSchema,
  created_at: z.string(),
})

export const paginationSchema = z.object({
  total: z.number(),
  current_page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
})

export const usersResponseSchema = z.object({
  data: z.array(userSchema),
  pagination: paginationSchema,
})

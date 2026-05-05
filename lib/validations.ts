import { z } from 'zod'

export const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
})

export type RegistrationInput = z.infer<typeof registrationSchema>

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(72, 'Password must be 72 characters or fewer'),
})

export type LoginInput = z.infer<typeof loginSchema>

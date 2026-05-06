import { z } from 'zod'
import { FILAMENT_TYPES } from '@/lib/constants'

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

export const modelMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be 2000 characters or fewer'),
  layerHeightMm: z.coerce
    .number()
    .min(0.05, 'Minimum 0.05mm')
    .max(1.0, 'Maximum 1.0mm'),
  infillPercent: z.coerce
    .number()
    .int('Must be a whole number')
    .min(0, '0–100%')
    .max(100, '0–100%'),
  supportsRequired: z.enum(['true', 'false']),
  filamentType: z.enum([...FILAMENT_TYPES] as [string, ...string[]], { error: 'Select a filament type' }),
})

export type ModelMetadataFormValues = z.infer<typeof modelMetadataSchema>

import { z } from 'zod';

export const registerSchema = z.object({
   name: z.
   string("Name is required")
   .trim()
   .min(2, "Minimum 2 characters are required")
   .max(50, "Maximum 50 characters are required"),
   email: z.email("Please provide valid email address"),
   password: z.
   string("Password is required")
   .min(8," minimun 8 characters required")
   .max(72, "Maximum 72 characters are required")

})

export const loginSchema = z.object({
    email: z.email('Please provide a valid email address'),
  // Only "is it there?" on purpose: users who registered under the old
  // 6-character rule must still be able to log in
  password: z.string('Password is required').min(1, 'Password is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>;
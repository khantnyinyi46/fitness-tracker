import * as z from 'zod'

export const SignupFormSchema = z.object({
    name: z
        .string()
        .min(2, { error: 'Name must be at least 2 characters long.' })
        .trim(),
    email: z.email({ error: 'Please enter a valid email.' }).trim(),
    password: z
        .string()
        .min(8, { error: 'Be at least 8 characters long' })
        .regex(/[a-zA-Z]/, { error: 'Contain at least one letter.' })
        .regex(/[0-9]/, { error: 'Contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, {
            error: 'Contain at least one special character.',
        })
        .trim(),
})

export const LoginFormSchema = z.object({
    email: z.email({ error: 'Please enter a valid email.' }).trim(),
    password: z.string().trim(),
})

export const CreateFormSchema = z.object({
    exercise_duration: z.number().min(1, { error: 'Duration must be at least 1 minute.' }),
        
})

export type FormState =
    | {
        errors?: {
            name?: string[]
            email?: string[]
            password?: string[]
        }
        message?: string
    }
    | undefined

export type SessionPayload = {
    userId: number
    expiresAt: Date
}

export type Workout = {
    id: string,
    user_id: string,
    exercise_name: string,
    duration_minutes: string,
    workout_date: string
}
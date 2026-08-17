'use server'
import { SignupFormSchema, FormState, LoginFormSchema } from '@/app/lib/definitions'
import { hashPassword, verifyPassword } from '../lib/bcryptjs';
import { createSession, deleteSession } from '../lib/session';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function signup(state: FormState, formData: FormData) {
    try {
        // Validate form fields
        const validatedFields = SignupFormSchema.safeParse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
        })

        // If any form fields are invalid, return earlys
        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
            }
        }


        const { data } = await supabase
            .from('users')
            .select()
            .eq('email', validatedFields.data.email)


        if (data && data.length > 0) {
            return { message: 'Account with this email already exists. Please enter a different email.' }
        }
        // Call the provider or db to create a user...
        const { name, email, password } = validatedFields.data
        // e.g. Hash the user's password before storing it
        //const hashedPassword = await bcrypt.hash(password, 10)
        const hashedPassword = await hashPassword(password);

        // 3. Insert the user into the database or call an Auth Library's API
        const { data: insertedUsers, error: insertedError } = await supabase.from('users').insert({
            name: name,
            email: email,
            password: hashedPassword
        }).select();

        if (insertedError || !insertedUsers || insertedUsers.length === 0) {
            return { message: 'An error occurred while creating your account.' }
        }

        const user_id = insertedUsers[0].user_id;
        await createSession(user_id)
        redirect('/dashboard')

    }
    catch (error) {
        // Don't treat Next.js's internal redirect signal as a real error
        if (isRedirectError(error)) {
            throw error;
        }
        console.error(error);
        return { message: 'An error occurred while creating your account.' }
    }
        
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}

export async function login(state: FormState, formData: FormData) {
    try {
        const validatedFields = LoginFormSchema.safeParse({
            email: formData.get('email'),
            password: formData.get('password'),
        })

        // If any form fields are invalid, return earlys

        if (!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
            }
        }

        // Call the provider or db to create a user...
        const { email, password } = validatedFields.data
        if (email != null && password != null) {

            const { data,error } = await supabase
                .from('users')
                .select('user_id,password')
                .eq('email', email)
                .single()

            if (error || !data) {
                    return { message: 'This email address does not exist.' }
            }

            const user_id = data.user_id;
            const passwordfromdb = data.password;
            const isPasswordCorrect = await verifyPassword(password, passwordfromdb);
            if (!isPasswordCorrect) {
                return { message: 'Incorrect password.' }

            }

            await createSession(user_id)
            redirect('/dashboard')
            
        }
    }
    catch (error) {
        // Don't treat Next.js's internal redirect signal as a real error
        if (isRedirectError(error)) {
            throw error;
        }

        console.error(error);
        return { message: 'An error occurred while logging in.' }
    }
}
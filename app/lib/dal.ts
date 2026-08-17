'use server'
import 'server-only'

import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

export const verifySession = cache(async () => {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    if (!session?.userId) {
        redirect('/login')
    }

    return { isAuth: true, userId: session.userId }
})

export const getUser = cache(async () => {

    const session = await verifySession()
    if (!session) return null

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data } = await supabase
            .from('users')
            .select('user_id, name, email')
            .eq('user_id', session.userId)

        const user = data?.at(0);

        return user
    } catch (error) {
        console.log('Failed to fetch user', error)
        return null
    }
})
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from '@/app/lib/definitions'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function encrypt(payload: SessionPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.log('Failed to verify session')
    }
}

export async function createSession(user_id: number) {
    try {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        // 1. Create a session in the database
        const data = await supabase.from('sessions').insert({ user_id: user_id, expiresAt: expiresAt }).select();
        const userId = data.data?.at(0).user_id;

        // 2. Encrypt the session ID
        const session = await encrypt({ userId, expiresAt })

        // 3. Store the session in cookies for optimistic auth checks
        const cookieStore = await cookies()
        cookieStore.set('session', session, {
            httpOnly: true,
            secure: true,
            expires: expiresAt,
            sameSite: 'lax',
            path: '/',
        })
    }
    catch (error) {
        console.log('Failed to create session',error)
    }
}

export async function updateSession() {
    try {
        const session = (await cookies()).get('session')?.value
        const payload = await decrypt(session)

        if (!session || !payload) {
            return null
        }

        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        const cookieStore = await cookies()
        cookieStore.set('session', session, {
            httpOnly: true,
            secure: true,
            expires: expires,
            sameSite: 'lax',
            path: '/',
        })
    }
    catch (error) {
        console.log('Failed to update session', error)
    }
}

export async function deleteSession() {
        const cookieStore = await cookies()
        const session = cookieStore.get('session')?.value
        if (session) {
            const payload = await decrypt(session)
            if (payload?.userId) {
                await supabase.from('sessions').delete().eq('user_id', payload.userId)
            }

            cookieStore.delete('session')
        }
}
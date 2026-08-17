import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/app/lib/session'

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/create', '/update']
const publicRoutes = ['/login', '/signup', '/']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname

    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
    const isPublicRoute = publicRoutes.includes(path)

    // ❗ Correct way to read cookies in middleware
    const cookie = req.cookies.get('session')?.value

    // ❗ decrypt() works because it only uses jose, not cookies()
    const session = await decrypt(cookie)

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // 5. Redirect to /dashboard if the user is authenticated
    if (
        isPublicRoute &&
        session?.userId &&
        !path.startsWith('/dashboard')
    ) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

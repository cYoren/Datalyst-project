import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const withCookieDefaults = (options: any) => ({
        ...options,
        sameSite: options?.sameSite ?? 'lax',
        secure: process.env.NODE_ENV === 'production',
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: any) {
                    cookiesToSet.forEach(({ name, value, options }: any) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }: any) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...withCookieDefaults(options),
                        })
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register') ||
        request.nextUrl.pathname.startsWith('/reset-password')

    const isAuthCallback = request.nextUrl.pathname.startsWith('/auth')
    const isPublicPage = ['/', '/privacy', '/terms', '/cookies', '/contact', '/manifest.json', '/site.webmanifest']
        .includes(request.nextUrl.pathname)

    // Protected routes - redirect to login if not authenticated
    if (!user && !isAuthPage && !isAuthCallback && !isPublicPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Redirect to dashboard if already logged in and trying to access auth pages
    if (user && isAuthPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

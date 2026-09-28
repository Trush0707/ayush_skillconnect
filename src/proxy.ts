import { NextRequest, NextResponse } from 'next/server'
import { createProxyClient } from '@/lib/supabase/middleware'

/**
 * proxy.ts — Next.js 16 route protection (replaces middleware.ts, which is
 * deprecated in v16; see node_modules/next/dist/docs/01-app/03-api-reference/
 * 03-file-conventions/proxy.md for the breaking-change notice).
 *
 * Strategy: optimistic cookie-only session check (no DB round-trip).
 * Security enforced at the data layer by Supabase RLS policies (Schema.md).
 *
 * Protected route prefixes → /student/*, /employer/*, /admin/*
 * Public routes → /, /login, /signup/*
 */

const PROTECTED_PREFIXES = ['/student', '/employer', '/admin']

export async function proxy(request: NextRequest) {
  // Build an initial response that we'll mutate (cookie refresh)
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Create SSR Supabase client — refreshes session cookies automatically
  const supabase = createProxyClient(request, response)

  // getUser() validates the JWT from the cookie without a DB round-trip
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  // Unauthenticated user hitting a protected route → /login
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user hitting /login → redirect to their area.
  // NOTE: /signup/* is intentionally excluded — an already-signed-in user
  // must be able to reach signup pages (e.g. to create a second account or
  // after a fresh signOut inside the signup server action). Redirecting them
  // away was the root cause of Student/Admin signup landing on
  // /employer/opportunities when the browser still held an employer session.
  const isLoginRoute = pathname === '/login'
  if (isLoginRoute && user) {
    const role =
      (user.user_metadata?.role as string | undefined) ?? 'student'
    const destination = roleDestination(role)
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return response
}

function roleDestination(role: string): string {
  switch (role) {
    case 'employer':
      return '/employer/opportunities'
    case 'admin':
      return '/admin/dashboard'
    case 'student':
    default:
      return '/student/profile'
  }
}

export const config = {
  matcher: [
    /*
     * Run on every path EXCEPT:
     *  - _next/static  (Next.js static assets)
     *  - _next/image   (image optimization)
     *  - favicon.ico
     *  - public files with a file extension
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}

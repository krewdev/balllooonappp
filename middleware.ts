import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // Check for session cookie (simplified - full validation happens in API routes)
    const sessionId = request.cookies.get('session')?.value
    
    // If no session cookie, redirect to login
    if (!sessionId) {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect pilot routes
  if (pathname.startsWith('/pilot') && !pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/how-it-works')) {
    const sessionId = request.cookies.get('session')?.value
    
    if (!sessionId) {
      const loginUrl = new URL('/pilot/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect passenger routes
  if (pathname.startsWith('/passenger') && !pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/book') && !pathname.includes('/consent')) {
    const sessionId = request.cookies.get('session')?.value
    
    if (!sessionId) {
      const loginUrl = new URL('/passenger/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect meister routes
  if (pathname.startsWith('/meister') && !pathname.includes('/login') && !pathname.includes('/register')) {
    const sessionId = request.cookies.get('session')?.value
    
    if (!sessionId) {
      const loginUrl = new URL('/meister/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/pilot/:path*',
    '/passenger/:path*',
    '/meister/:path*',
  ],
}

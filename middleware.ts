import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Determine response based on route protection
  let response: NextResponse

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to login page
    if (pathname === '/admin/login') {
      response = NextResponse.next()
    } else {
      // Check for session cookie (simplified - full validation happens in API routes)
      const sessionId = request.cookies.get('session')?.value
      
      // If no session cookie, redirect to login
      if (!sessionId) {
        const loginUrl = new URL('/admin/login', request.url)
        response = NextResponse.redirect(loginUrl)
      } else {
        response = NextResponse.next()
      }
    }
  }
  // Protect pilot routes
  else if (pathname.startsWith('/pilot') && !pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/how-it-works')) {
    const sessionId = request.cookies.get('session')?.value
    
    if (!sessionId) {
      const loginUrl = new URL('/pilot/login', request.url)
      response = NextResponse.redirect(loginUrl)
    } else {
      response = NextResponse.next()
    }
  }
  // Protect passenger routes
  else if (pathname.startsWith('/passenger') && !pathname.includes('/login') && !pathname.includes('/register') && !pathname.includes('/book') && !pathname.includes('/consent')) {
    const sessionId = request.cookies.get('session')?.value
    
    if (!sessionId) {
      const loginUrl = new URL('/passenger/login', request.url)
      response = NextResponse.redirect(loginUrl)
    } else {
      response = NextResponse.next()
    }
  }
  // Protect meister routes
  else if (pathname.startsWith('/meister') && !pathname.includes('/login') && !pathname.includes('/register')) {
    const sessionId = request.cookies.get('session')?.value
    
    if (!sessionId) {
      const loginUrl = new URL('/meister/login', request.url)
      response = NextResponse.redirect(loginUrl)
    } else {
      response = NextResponse.next()
    }
  }
  // All other routes
  else {
    response = NextResponse.next()
  }

  // Add security headers to all responses
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', isProduction ? 'max-age=63072000; includeSubDomains; preload' : 'max-age=0')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy (adjust as needed for your app)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://vercel.live https://*.vercel.app",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.stripe.com https://*.twilio.com https://vercel.live https://*.vercel.app https://vitals.vercel-insights.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', csp)
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/pilot/:path*',
    '/passenger/:path*',
    '/meister/:path*',
  ],
}

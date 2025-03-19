import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/admin'];
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return res;
  }

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Get user role from site_users table
  const { data: siteUser, error } = await supabase
    .from('site_users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  console.log('Middleware - User ID:', session.user.id);
  console.log('Middleware - Site User Data:', siteUser);
  console.log('Middleware - Error:', error);

  // If there's an error or no site user found, treat as customer
  if (error || !siteUser) {
    console.log('Middleware - No site user found or error, treating as customer');
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/shop', request.url));
    }
    return res;
  }

  // Restrict dashboard access to admins only
  if (request.nextUrl.pathname.startsWith('/dashboard') && siteUser.role !== 'admin') {
    console.log('Middleware - Non-admin attempting to access dashboard');
    return NextResponse.redirect(new URL('/shop', request.url));
  }

  // Restrict shop access to customers only
  if (request.nextUrl.pathname.startsWith('/shop') && siteUser.role === 'admin') {
    console.log('Middleware - Admin attempting to access shop');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;

  // 1. Define Public Routes (Never redirect unauthenticated users away from these)
  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/customer/login' || pathname === '/customer/register';

  // 2. Define Protected Routes Categories
  const isCustomerPortalRoute = pathname.startsWith('/customer') && !['/customer/login', '/customer/register'].includes(pathname);
  // Any route under /dashboard is the Staff dashboard
  const isStaffDashboardRoute = pathname.startsWith('/dashboard');

  let isCustomer = false;
  let userRole = 'staff';

  if (user) {
    // Fetch user role from user_profiles table as the single source of truth
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      userRole = profile.role;
      isCustomer = userRole === 'customer';
    } else {
      // Fallback if profile doesn't exist yet
      isCustomer = user?.user_metadata?.role === 'customer';
    }
  }

  // ==========================================
  // UNAUTHENTICATED USERS
  // ==========================================
  if (!user) {
    if (isCustomerPortalRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/customer/login'
      return NextResponse.redirect(url)
    }
    if (isStaffDashboardRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // Allow access to /, /login, /customer/login, /customer/register
    return supabaseResponse;
  }

  // ==========================================
  // AUTHENTICATED USERS
  // ==========================================
  if (user) {
    // ONLY protect the dashboards. Do NOT auto-redirect them away from the login pages so they can switch accounts or test.
    
    // Cross-portal protection: prevent staff from accessing customer dashboard and vice versa
    if (isCustomerPortalRoute && !isCustomer) {
      // Staff trying to access customer portal -> block and redirect to staff dash
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    if (isStaffDashboardRoute && isCustomer) {
      // Customer trying to access staff dashboard -> block and redirect to customer dash
      const url = request.nextUrl.clone()
      url.pathname = '/customer/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Allow access
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

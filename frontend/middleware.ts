import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET as string });
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/tree') ||
    pathname.startsWith('/api/checklist') ||
    pathname.startsWith('/api/attachments') ||
    pathname === '/login' ||
    pathname === '/model-select' ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
}; 
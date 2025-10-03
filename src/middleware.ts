import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Function to validate token and user data from cookies
function isAuthValid(request: NextRequest): boolean {
  const token = request.cookies.get("token")?.value;
  const userCookie = request.cookies.get("user")?.value;
  // const tokenExpiry = request.cookies.get("tokenExpiry")?.value;
  
  // Must have all required cookies
  if (!token || !userCookie ) return false;
  
  try {
    // Check token expiry from cookie
    // if (parseInt(tokenExpiry) < Date.now()) return false;
    
    // Basic JWT structure check (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Basic validation - just check if payload exists and is valid JSON
    const payload = JSON.parse(atob(parts[1]));
    
    // Validate user data
    const userData = JSON.parse(decodeURIComponent(userCookie));
    if (!userData.user) return false;
    
    return true;
  } catch (error) {
    // If token is malformed or can't be decoded
    return false;
  }
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // List of paths that don't require authentication
  const publicPaths = ["/auth/sign-in", "/auth/forgot-password"];

  // Check if the current path is public
  const isPublicPath = publicPaths.some((p) => path.startsWith(p));
  
  // Validate auth cookies
  const hasValidAuth = isAuthValid(request);
  
  // If auth data exists but is invalid, create response to clear the cookies
  if (token && !hasValidAuth && !isPublicPath) {
    const response = NextResponse.redirect(new URL("/auth/sign-in", request.url));
    response.cookies.set("token", "", {  path: "/" });
    response.cookies.set("user", "", { path: "/" });
    // response.cookies.set("tokenExpiry", "", { path: "/" });
    return response;
  }

  // If path is public and user has valid auth, redirect to dashboard
  if (isPublicPath && hasValidAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If path is private and user doesn't have valid auth, redirect to login
  if (!isPublicPath && !hasValidAuth) {
    // Store the attempted URL to redirect back after login
    const redirectUrl = new URL("/auth/sign-in", request.url);
    redirectUrl.searchParams.set("callbackUrl", path);
    const response = NextResponse.redirect(redirectUrl);
    // Clear invalid cookies if they exist
    if (token) {
      response.cookies.set("token", "", { path: "/" });
      response.cookies.set("user", "", { path: "/" });
      // response.cookies.set("tokenExpiry", "", { path: "/" });
    }
    return response;
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};

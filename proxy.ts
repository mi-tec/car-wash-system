import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    const verifyed = await jwtVerify(token!, secret);

    if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      if (!verifyed) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }

    if (request.nextUrl.pathname === "/admin/login" && token) {
      console.log("Already logged in, redirecting to dashboard");
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (!verifyed) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    if (request.nextUrl.pathname === "/login" && token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    if (request.nextUrl.pathname.startsWith("/admin/dashboard")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/login",
    "/dashboard/:path*",
    "/login",
    // "/profile/:path*",
    // "/api/private/:path*",
    // '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)', // everything except public
  ],
};

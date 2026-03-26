import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE } from "./lib/auth";

export function proxy(req) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = cookie === AUTH_COOKIE_VALUE;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/home") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*"],
};

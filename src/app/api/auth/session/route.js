import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_VALUE } from "../../../../lib/auth";

export async function GET(req) {
  const cookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  return NextResponse.json({ authenticated: cookie === AUTH_COOKIE_VALUE });
}

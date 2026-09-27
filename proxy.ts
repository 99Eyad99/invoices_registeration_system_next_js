import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, safeRedirectPath, verifySessionToken } from "@/lib/session";

// Every route requires login except the login page itself.
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (!session) return NextResponse.next();
    const target = safeRedirectPath(request.nextUrl.searchParams.get("from"));
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname + search);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(SESSION_COOKIE); // clear an expired/invalid cookie
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const isProtectedRoute =
      pathname === "/create" ||
      pathname === "/home" ||
      pathname === "/admin-dashboard";

    if (token && (pathname === "/signin" || pathname === "/signup" || pathname === "/")) {
      return NextResponse.redirect(new URL("/home", req.nextUrl.origin));
    }

    if (!token && isProtectedRoute) {
      return NextResponse.redirect(new URL("/signin", req.nextUrl.origin));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/signin",
    },
  }
);

export const config = {
  matcher: ["/signin", "/home", "/create", "/admin-dashboard"],
};

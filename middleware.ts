import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();

  // If user is signed in and on homepage, redirect to dashboard
  if (authData.userId && req.nextUrl.pathname === "/") {
    const dashboard = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboard);
  }

  // If user is not signed in and trying to access protected route
  if (!authData.userId && !isPublicRoute(req)) {
    const signIn = new URL("/sign-in", req.url);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
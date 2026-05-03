import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { routing, type Locale, isRTL } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes requiring authentication (any role)
const PROTECTED_PATHS = [
  "/dashboard",
  "/profile",
  "/chat",
  "/opportunities",
  "/freelance",
  "/onboarding",
];

// Routes requiring admin role
const ADMIN_PATHS = ["/admin"];

// Routes requiring university role
const UNIVERSITY_PATHS = ["/university"];

function stripLocale(pathname: string): string {
  // Remove /en | /fr | /ar prefix
  const regex = new RegExp(`^/(${routing.locales.join("|")})`);
  return pathname.replace(regex, "") || "/";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const strippedPath = stripLocale(pathname);

  const { user, supabaseResponse } = await createMiddlewareClient(request);

  // Determine which locale is in the URL (for redirect construction)
  const localeMatch = pathname.match(
    new RegExp(`^/(${routing.locales.join("|")})`)
  );
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  const redirectToLogin = () => {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  };

  // ── Admin protection ───────────────────────────────────────────────────────
  if (ADMIN_PATHS.some((p) => strippedPath.startsWith(p))) {
    if (!user) return redirectToLogin();

    // Fetch user role from DB via service role is not available in middleware.
    // We rely on a custom JWT claim `app_role` set via Supabase auth hook.
    const appRole =
      (user.user_metadata?.app_role as string | undefined) ?? "";

    if (appRole !== "admin") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // ── University protection ──────────────────────────────────────────────────
  if (UNIVERSITY_PATHS.some((p) => strippedPath.startsWith(p))) {
    if (!user) return redirectToLogin();

    const appRole =
      (user.user_metadata?.app_role as string | undefined) ?? "";

    if (appRole !== "university" && appRole !== "admin") {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // ── General auth protection ────────────────────────────────────────────────
  if (PROTECTED_PATHS.some((p) => strippedPath.startsWith(p))) {
    if (!user) return redirectToLogin();
  }

  // ── next-intl locale handling ──────────────────────────────────────────────
  const intlResponse = intlMiddleware(request);

  // Merge Supabase session cookies into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
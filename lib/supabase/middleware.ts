import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/auth/callback");
  const isApiRoute = pathname.startsWith("/api/");
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, skip the auth refresh and pass through.
  // Without this guard createServerClient throws "Your project's URL and Key
  // are required", crashing the edge middleware on every route (500
  // MIDDLEWARE_INVOCATION_FAILED).
  if (!url || !anonKey) {
    if (isPublicRoute) return supabaseResponse;
    if (isApiRoute) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
    return redirectToLogin(request);
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!user && !isPublicRoute) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      }
      return redirectToLogin(request);
    }

    return supabaseResponse;
  } catch {
    if (isPublicRoute) return supabaseResponse;
    if (isApiRoute) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectedFrom", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

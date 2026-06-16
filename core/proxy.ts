// import { NextRequest, NextResponse } from "next/server";

// // --- Types ---
// type Role = "student" | "admin" | "guest";

// interface RouteConfig {
//   roles: Role[];
//   redirect?: string;
// }

// // --- Route permission map ---
// const ROUTE_PERMISSIONS: Record<string, RouteConfig> = {
//   "/admin/":         { roles: ["admin"],                       redirect: "/unauthorized" },
//   "/dashboard/":     { roles: ["student"],   redirect: "/unauthorized" },
//   "/course/":        { roles: ["student"],   redirect: "/unauthorized" },
//   "/all-courses/":   { roles: ["student"],   redirect: "/unauthorized" },
//   "/plans/":          { roles: ["student"],   redirect: "/unauthorized" },
// };

// // Public paths — always allowed
// const PUBLIC_PATHS = ["/", "/login", "/register", "/unauthorized", "not-found"];

// // --- Helpers ---
// function matchRoute(pathname: string): RouteConfig | null {
//   // Exact match first, then prefix match (longest wins)
//   const sorted = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
//   for (const route of sorted) {
//     if (pathname === route || pathname.startsWith(route + "/")) {
//       return ROUTE_PERMISSIONS[route];
//     }
//   }
//   return null;
// }

// async function verifySessionCookie(sessionCookie: string): Promise<{
//   uid: string;
//   role: Role;
// } | null> {
//   try {
//     // Call your own API route that wraps Firebase Admin SDK verification
//     // This avoids shipping firebase-admin to the Edge runtime
//     const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ sessionCookie }),
//     });

//     if (!res.ok) return null;

//     const data = await res.json();
//     // data.role comes from a custom claim set server-side: auth.setCustomUserClaims(uid, { role })
//     return { uid: data.uid, role: data.role ?? "viewer" };
//   } catch {
//     return null;
//   }
// }

// // --- Middleware ---
// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // 1. Always allow public paths
//   if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
//     return NextResponse.next();
//   }

//   // 2. Find matching route config
//   const routeConfig = matchRoute(pathname);
//   if (!routeConfig) {
//     // No config = protected by default; require auth
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // 3. Get session cookie (set server-side via Firebase Admin)
//   const sessionCookie = request.cookies.get("__session")?.value;
//   if (!sessionCookie) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // 4. Verify token + extract role
//   const session = await verifySessionCookie(sessionCookie);
//   if (!session) {
//     const response = NextResponse.redirect(new URL("/login", request.url));
//     response.cookies.delete("__session"); // Clear invalid cookie
//     return response;
//   }

//   // 5. Check role authorization
//   const { role } = session;
//   if (!routeConfig.roles.includes(role)) {
//     const redirectTo = routeConfig.redirect ?? "/unauthorized";
//     return NextResponse.redirect(new URL(redirectTo, request.url));
//   }

//   // 6. Authorized — pass role in header for downstream use (Server Components, API routes)
//   const response = NextResponse.next();
//   response.headers.set("x-user-role", role);
//   response.headers.set("x-user-uid", session.uid);
//   return response;
// }

// export const config = {
//   matcher: [
//     // Run on all routes except static files, _next internals, and API auth routes
//     "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
//   ],
// };
import type { NextConfig } from "next";

// The Mathify API is a separate JAX-RS backend. We proxy `/api/*` to it so the
// browser talks to the Next.js origin only — that keeps the JSESSIONID session
// cookie same-origin (no CORS) for both the auth flow and the @Secured endpoints.
// In production the backend is typically served under the same origin at `/api`,
// in which case this rewrite is a no-op passthrough.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

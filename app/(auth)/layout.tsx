import type { ReactNode } from "react";
import "./auth.css";

// Nested layout for the auth screens — just loads the shared auth styles.
// (The root app/layout.tsx already provides <html>/<body>, fonts and tokens.)
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

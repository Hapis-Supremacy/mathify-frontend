import type { ReactNode } from "react";
import { RequireRole } from "@/app/(shared)/auth";

// Gate the admin console to signed-in ADMIN sessions. The page itself is a
// client component; this layout wraps it in the RBAC guard.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireRole role="ADMIN">{children}</RequireRole>;
}

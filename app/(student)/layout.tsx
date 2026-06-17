import type { ReactNode } from "react";
import { StudentProvider } from "@/app/(shared)/student";
import { RequireRole } from "@/app/(shared)/auth";
import { Nav } from "@/app/(shared)/chrome";
import { Toast } from "@/app/(shared)/toast";

// Shared chrome for every enrolled-student page: the sticky Nav (Today · My
// Library · All Courses + profile/notifications) and the transient Toast.
// RequireRole gates the whole group to signed-in STUDENT sessions.
// StudentProvider currently supplies fallback profile data — see student.tsx.
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="STUDENT">
      <StudentProvider>
        <Nav />
        {children}
        <Toast />
      </StudentProvider>
    </RequireRole>
  );
}

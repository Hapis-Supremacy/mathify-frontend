import type { ReactNode } from "react";
import { StudentProvider } from "@/app/(shared)/student";
import { Nav } from "@/app/(shared)/chrome";
import { Toast } from "@/app/(shared)/toast";

// Shared chrome for every enrolled-student page: the sticky Nav (Today · My
// Library · All Courses + profile/notifications) and the transient Toast.
// StudentProvider currently supplies fallback profile data — see student.tsx.
export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <StudentProvider>
      <Nav />
      {children}
      <Toast />
    </StudentProvider>
  );
}

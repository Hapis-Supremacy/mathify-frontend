"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/core/firebase";
import type { Role } from "@/core/api";

// Client-side RBAC route guards.
//
// These gate the *UI* so a signed-out user (or the wrong role) never sees a
// protected screen and is bounced to /login or /unauthorized. They are NOT the
// security boundary — the backend's @Secured/role checks on every /api call are
// the real enforcement; the client can't be trusted. Two signals are combined:
//   • authentication — the Firebase auth session (persisted across reloads), and
//   • role — cached in localStorage at login (setStoredRole, below).
// If the cached role is missing we send the user back to /login to re-establish
// it rather than guessing.

const ROLE_KEY = "mathify-role";

export const setStoredRole = (role: Role) => {
  try { localStorage.setItem(ROLE_KEY, role); } catch { /* no localStorage */ }
};
export const getStoredRole = (): Role | null => {
  try { return (localStorage.getItem(ROLE_KEY) as Role | null) || null; } catch { return null; }
};
export const clearStoredRole = () => {
  try { localStorage.removeItem(ROLE_KEY); } catch { /* no localStorage */ }
};

type GateStatus = "checking" | "ok" | "no-auth" | "wrong-role";

const Gate = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontSize: 14 }}>
    {children}
  </div>
);

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<GateStatus>("checking");

  useEffect(() => {
    // Fires once Firebase resolves the persisted session (and again on changes).
    const unsub = onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) { setStatus("no-auth"); return; }
      const stored = getStoredRole();
      if (!stored) { setStatus("no-auth"); return; } // signed in but role unknown → re-login
      setStatus(stored === role ? "ok" : "wrong-role");
    });
    return () => unsub();
  }, [role]);

  useEffect(() => {
    if (status === "no-auth") router.replace("/login");
    else if (status === "wrong-role") router.replace("/unauthorized");
  }, [status, router]);

  if (status === "ok") return <>{children}</>;
  return <Gate>{status === "checking" ? "Checking your access…" : "Redirecting…"}</Gate>;
}

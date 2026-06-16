import Link from "next/link";
import { Logo, Icon } from "@/app/(shared)/icons";

export default function UnauthorizedPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      <span className="serif" style={{ position: "absolute", left: "14%", bottom: "20%", fontSize: 110, color: "var(--rose)", opacity: 0.1, fontWeight: 600, pointerEvents: "none" }}>∅</span>
      <span className="serif" style={{ position: "absolute", right: "12%", top: "18%", fontSize: 90, color: "var(--plum)", opacity: 0.12, fontWeight: 600, pointerEvents: "none" }}>θ</span>

      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <Logo/>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.015em" }}>Mathify</span>
      </Link>

      <div style={{ width: 72, height: 72, borderRadius: 20, background: "var(--rose-soft)", color: "var(--rose)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        <Icon.Lock style={{ width: 28, height: 28 }}/>
      </div>
      <h1 style={{ margin: "16px 0 10px", fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, letterSpacing: "-0.025em" }}>Access denied</h1>
      <p style={{ margin: "0 0 32px", fontSize: 16, color: "var(--ink-2)", maxWidth: 440, lineHeight: 1.6 }}>
        You don&rsquo;t have permission to view this page. If you think this is a mistake, try signing in with a different account.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 13, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 0 var(--green-deep)" }}>
          Sign in <Icon.Arrow/>
        </Link>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 20px", borderRadius: 13, background: "var(--paper)", color: "var(--ink)", border: "1px solid var(--line)", fontWeight: 600, fontSize: 15 }}>
          Back home
        </Link>
      </div>
    </main>
  );
}

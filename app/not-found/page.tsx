import Link from "next/link";
import { Logo, Icon } from "@/app/(shared)/icons";

export default function NotFoundPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      <span className="serif" style={{ position: "absolute", left: "12%", top: "18%", fontSize: 120, color: "var(--green)", opacity: 0.1, fontWeight: 600, pointerEvents: "none" }}>∫</span>
      <span className="serif" style={{ position: "absolute", right: "10%", bottom: "16%", fontSize: 96, color: "var(--amber)", opacity: 0.12, fontWeight: 600, pointerEvents: "none" }}>π</span>

      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
        <Logo/>
        <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.015em" }}>Mathify</span>
      </Link>

      <div className="serif" style={{ fontSize: "clamp(64px, 12vw, 120px)", fontWeight: 600, color: "var(--green-deep)", lineHeight: 1, letterSpacing: "-0.04em" }}>404</div>
      <h1 style={{ margin: "16px 0 10px", fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 700, letterSpacing: "-0.025em" }}>This page is undefined.</h1>
      <p style={{ margin: "0 0 32px", fontSize: 16, color: "var(--ink-2)", maxWidth: 420, lineHeight: 1.6 }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved. Let&rsquo;s get you back on track.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 13, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 15, boxShadow: "0 2px 0 var(--green-deep)" }}>
          Go to dashboard <Icon.Arrow/>
        </Link>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 20px", borderRadius: 13, background: "var(--paper)", color: "var(--ink)", border: "1px solid var(--line)", fontWeight: 600, fontSize: 15 }}>
          Back home
        </Link>
      </div>
    </main>
  );
}

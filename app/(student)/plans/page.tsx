"use client";

import type { SVGProps } from "react";
import { Icon } from "@/app/(shared)/icons";
import { notify } from "@/app/(shared)/toast";

// Plans / upgrade page. The backend has no billing or plan-status endpoint yet,
// so plan status defaults to the free/sandbox view and the checkout CTAs surface
// a toast instead of hitting a (non-existent) checkout route.
const CURRENT_PLAN = "FREE";
const IS_PREMIUM = false;
const IS_PRODUCTION = false;

const Crown = (p: SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M2 11L4 6L8 10L12 6L14 11H2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M1.5 13H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><circle cx="2" cy="5.5" r="1.2" fill="currentColor"/><circle cx="14" cy="5.5" r="1.2" fill="currentColor"/><circle cx="8" cy="4" r="1.2" fill="currentColor"/></svg>
);

interface Plan {
  id: string;
  label: string;
  price: string;
  period: string;
  sub?: string;
  description: string;
  accent: string;
  accentBg: string;
  recommended: boolean;
  paid: boolean;
  features: { text: string; included: boolean }[];
}

const PLANS: Plan[] = [
  {
    id: "FREE", label: "Free", price: "Rp 0", period: "forever",
    description: "Great for getting started with the basics.",
    accent: "var(--ink-3)", accentBg: "var(--bg-2)", recommended: false, paid: false,
    features: [
      { text: "3 starter courses", included: true },
      { text: "Basic progress tracking", included: true },
      { text: "Community forum access", included: true },
      { text: "Mobile-friendly interface", included: true },
      { text: "Full course library (50+ courses)", included: false },
      { text: "Completion certificates", included: false },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Downloadable resources", included: false },
    ],
  },
  {
    id: "MONTHLY", label: "Monthly", price: "Rp 120.000", period: "per month",
    description: "Full access, billed monthly. Cancel anytime.",
    accent: "var(--blue)", accentBg: "var(--blue-soft)", recommended: false, paid: true,
    features: [
      { text: "Everything in Free", included: true },
      { text: "Full course library (50+ courses)", included: true },
      { text: "Completion certificates", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Downloadable resources", included: true },
      { text: "Early access to new courses", included: true },
      { text: "Offline mode", included: false },
      { text: "Dedicated study coach", included: false },
    ],
  },
  {
    id: "ANNUAL", label: "Annual", price: "Rp 1.440.000", period: "per year",
    sub: "≈ Rp 120.000 / month",
    description: "Full access for a full year. Pay once, study all year.",
    accent: "var(--green)", accentBg: "var(--green-soft)", recommended: true, paid: true,
    features: [
      { text: "Everything in Free", included: true },
      { text: "Full course library (50+ courses)", included: true },
      { text: "Completion certificates", included: true },
      { text: "Priority support", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Downloadable resources", included: true },
      { text: "Early access to new courses", included: true },
      { text: "Offline mode (coming soon)", included: true },
      { text: "Dedicated study coach (coming soon)", included: true },
    ],
  },
];

const PlanCard = ({ plan }: { plan: Plan }) => {
  const isCurrent = CURRENT_PLAN === plan.id;
  return (
    <div style={{
      position: "relative", background: "var(--paper)",
      border: isCurrent || plan.recommended ? `2px solid ${plan.accent}` : "1.5px solid var(--line)",
      borderRadius: 24, padding: "28px 28px 24px", display: "flex", flexDirection: "column",
      boxShadow: plan.recommended ? "var(--shadow-lg)" : "var(--shadow-sm)",
      transform: plan.recommended ? "scale(1.02)" : "none",
    }}>
      <div style={{ position: "absolute", top: -13, left: 24, display: "flex", gap: 6 }}>
        {plan.recommended && !isCurrent && (
          <span style={{ padding: "3px 10px", borderRadius: 999, background: plan.accent, color: "white", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>RECOMMENDED</span>
        )}
        {isCurrent && (
          <span style={{ padding: "3px 10px", borderRadius: 999, background: plan.accent, color: "white", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>✓ CURRENT PLAN</span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, marginTop: plan.recommended || isCurrent ? 8 : 0 }}>
        {plan.paid && <span style={{ display: "inline-flex", color: plan.accent }}><Crown/></span>}
        <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" }}>{plan.label}</span>
      </div>

      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--ink)" }}>{plan.price}</span>
        <span style={{ fontSize: 14, color: "var(--ink-3)", marginLeft: 4 }}>/ {plan.period}</span>
      </div>
      {plan.sub && <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{plan.sub}</div>}

      <p style={{ margin: "12px 0 20px", fontSize: 14, color: "var(--ink-3)", lineHeight: 1.5 }}>{plan.description}</p>

      {plan.paid ? (
        isCurrent ? (
          <div style={{ padding: "11px 20px", borderRadius: 12, background: plan.accentBg, color: plan.accent, fontWeight: 700, fontSize: 14, textAlign: "center", marginBottom: 24 }}>Active plan</div>
        ) : (
          <button onClick={() => notify(`Checkout for ${plan.label} is coming soon`)}
             style={{ display: "block", width: "100%", padding: "11px 20px", borderRadius: 12, background: plan.accent, color: "white", fontWeight: 700, fontSize: 14, textAlign: "center", border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 2px 0 color-mix(in srgb, ${plan.accent} 70%, black)`, marginBottom: 24 }}>
            Get {plan.label} →
          </button>
        )
      ) : (
        <div style={{ padding: "11px 20px", borderRadius: 12, background: isCurrent ? "var(--bg-2)" : "var(--bg)", border: "1px solid var(--line)", color: "var(--ink-3)", fontWeight: 700, fontSize: 14, textAlign: "center", marginBottom: 24 }}>
          {isCurrent ? "Current plan" : "No cost"}
        </div>
      )}

      <div style={{ height: 1, background: "var(--line)", marginBottom: 20 }}/>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ flexShrink: 0, marginTop: 1, width: 18, height: 18, borderRadius: 999, background: f.included ? plan.accentBg : "var(--bg)", color: f.included ? plan.accent : "var(--ink-3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {f.included ? <Icon.Check style={{ width: 11, height: 11 }}/> : <span style={{ fontSize: 11, fontWeight: 700, opacity: 0.4 }}>—</span>}
            </span>
            <span style={{ fontSize: 13, color: f.included ? "var(--ink-2)" : "var(--ink-3)", opacity: f.included ? 1 : 0.6, lineHeight: 1.4 }}>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PlansPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {!IS_PRODUCTION && (
        <div style={{ background: "var(--amber-soft)", borderBottom: "1px solid var(--amber)", padding: "8px 24px", textAlign: "center" }}>
          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--amber-deep)", letterSpacing: "0.04em" }}>
            ⚡ SANDBOX MODE — no real charges will be made
          </span>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 24px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <span className="serif" style={{ position: "absolute", left: "5%", top: 20, fontSize: 120, color: "var(--amber)", opacity: 0.08, fontWeight: 600, pointerEvents: "none" }}>∑</span>
        <span className="serif" style={{ position: "absolute", right: "8%", top: 40, fontSize: 90, color: "var(--green)", opacity: 0.08, fontWeight: 600, pointerEvents: "none" }}>π</span>

        {IS_PREMIUM ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 999, background: "var(--amber-soft)", color: "var(--amber-deep)", fontWeight: 700, fontSize: 13, marginBottom: 18 }}>
            <Crown/> You&rsquo;re on Premium · {CURRENT_PLAN}
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 999, background: "var(--green-soft)", color: "var(--green-deep)", fontWeight: 700, fontSize: 13, marginBottom: 18 }}>
            <Icon.Sparkle/> Upgrade your learning
          </div>
        )}

        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          {IS_PREMIUM ? "Manage your plan" : "Go"}{" "}
          <span className="serif" style={{ color: "var(--green-deep)", fontWeight: 500 }}>{IS_PREMIUM ? "" : "Premium"}</span>
        </h1>
        <p style={{ margin: "0 auto", fontSize: 17, color: "var(--ink-3)", maxWidth: 520, lineHeight: 1.6 }}>
          {IS_PREMIUM
            ? "You already have full access. Your subscription details are shown below."
            : "Unlock every course, earn certificates, and accelerate your math journey. No hidden fees."}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
          {PLANS.map((plan) => <PlanCard key={plan.id} plan={plan}/>)}
        </div>
        <div style={{ marginTop: 40, textAlign: "center", color: "var(--ink-3)", fontSize: 13, lineHeight: 1.7 }}>
          <p style={{ margin: "0 0 6px" }}>All payments are processed securely via Midtrans. Prices in Indonesian Rupiah (IDR).</p>
          <p style={{ margin: 0 }}>Premium grants access to all available courses for the duration of your subscription. Questions? <a href="#" style={{ color: "var(--ink-2)", fontWeight: 600, textDecoration: "underline" }}>Contact support</a>.</p>
        </div>
      </div>
    </div>
  );
}

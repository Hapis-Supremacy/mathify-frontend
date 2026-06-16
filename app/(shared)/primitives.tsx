import type { ReactNode } from "react";

// Small presentational building blocks shared across pages. Pure — no hooks.

export const Avatar = ({ letter, color, size = 32 }: { letter: ReactNode; color: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: 999, background: color, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.42, flexShrink: 0 }}>{letter}</div>
);

const STAT_CHIP_COLORS = {
  amber: { bg: "var(--amber-soft)", fg: "var(--amber-deep)" },
  green: { bg: "var(--green-soft)", fg: "var(--green-deep)" },
  rose: { bg: "var(--rose-soft)", fg: "var(--rose)" },
};

export const StatChip = ({ color, icon, value, label }: { color: keyof typeof STAT_CHIP_COLORS; icon: ReactNode; value: ReactNode; label: ReactNode }) => {
  const c = STAT_CHIP_COLORS[color];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 12px 6px 8px", borderRadius: 999, background: c.bg, color: c.fg, fontWeight: 700, fontSize: 13 }}>
      <span style={{ display: "inline-flex" }}>{icon}</span>
      <span>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{label}</span>
    </div>
  );
};

export const StatCardShell = ({ children, accent }: { children: ReactNode; accent?: string }) => (
  <div style={{ position: "relative", padding: 22, borderRadius: 20, background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", minHeight: 188, overflow: "hidden" }}>
    {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }}/>}
    {children}
  </div>
);

export const StatLabel = ({ icon, color, label, deep }: { icon: ReactNode; color: string; label: ReactNode; deep: string }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: color, color: deep, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", width: "fit-content", marginBottom: 14 }}>{icon}{label}</div>
);

export const COLOR_MAP: Record<string, { bg: string; deep: string; solid: string }> = {
  green: { bg: "var(--green-soft)", deep: "var(--green-deep)", solid: "var(--green)" },
  blue:  { bg: "var(--blue-soft)",  deep: "var(--blue-deep)",  solid: "var(--blue)"  },
  amber: { bg: "var(--amber-soft)", deep: "var(--amber-deep)", solid: "var(--amber)" },
  plum:  { bg: "var(--plum-soft)",  deep: "var(--plum)",       solid: "var(--plum)"  },
  rose:  { bg: "var(--rose-soft)",  deep: "var(--rose)",       solid: "var(--rose)"  },
};

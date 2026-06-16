// Shared formatting helpers ported from the old frontend.

// Flexible duration: hours → days → weeks → months.
export function flexTime(h: number | string | null | undefined): string {
  if (!h) return "";
  const n = typeof h === "number" ? h : parseFloat(h);
  if (isNaN(n)) return String(h);
  if (n < 1) return "< 1 hr";
  if (n < 24) return Math.round(n) + (Math.round(n) === 1 ? " hr" : " hrs");
  const days = Math.round(n / 24);
  if (days < 14) return days + (days === 1 ? " day" : " days");
  const weeks = Math.round(n / 168);
  if (weeks < 8) return weeks + (weeks === 1 ? " week" : " weeks");
  const months = Math.round(n / 720);
  return months + (months === 1 ? " month" : " months");
}

export const timeAgo = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60); if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24); if (d < 7) return d + "d ago";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

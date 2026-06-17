"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon, Logo } from "@/app/(shared)/icons";
import { Avatar } from "@/app/(shared)/primitives";
import { NotificationBell } from "@/app/(shared)/notification-bell";
import { useStudent } from "@/app/(shared)/student";
import { clearStoredRole } from "@/app/(shared)/auth";
import { api } from "@/core/api";

const NAV_ITEMS = [
  { id: "today",   label: "Today",       icon: <Icon.Compass/>, href: "/dashboard",   match: "/dashboard" },
  { id: "library", label: "My Library",  icon: <Icon.Book/>,    href: "/courses",     match: "/courses" },
  { id: "courses", label: "All Courses", icon: <Icon.Grid/>,    href: "/all-courses", match: "/all-courses" },
  { id: "tree",    label: "Skill tree",  icon: <Icon.Tree/>,    href: "/skill-tree",  match: "/skill-tree" },
];

function useLogout() {
  const router = useRouter();
  return async () => {
    try { await api.logout(); } catch { /* ignore — clear client state regardless */ }
    clearStoredRole();
    router.push("/login");
    router.refresh();
  };
}

const ProfilePopover = ({ onClose }: { onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const student = useStudent();
  const logout = useLogout();

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const stats = [
    { color: "var(--amber-deep)", icon: <Icon.Flame/>, value: student.streak > 0 ? String(student.streak) : "0", label: "streak" },
    { color: "var(--green-deep)", icon: <Icon.Bolt/>,  value: student.xp > 0 ? student.xp.toLocaleString() : "0", label: "total xp" },
    { color: "var(--rose)",       icon: <Icon.Heart/>, value: "5", label: "energy" },
  ];
  const menuItems = [
    { icon: <Icon.Star/>,    label: "My Profile",     href: "#" },
    { icon: <Icon.Sparkle/>, label: "Update plan",    href: "/plans" },
    { icon: <Icon.Book/>,    label: "Help & Support", href: "#" },
  ];
  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 100, width: 248, borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "0 4px 0 rgba(20,18,10,.06), 0 30px 60px -20px rgba(20,18,10,.18)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 14px" }}>
        <Avatar letter={student.initial || "S"} color="var(--green)" size={40}/>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{student.name || "Student"}</div>
          <span className="mono" style={{ fontSize: 11, padding: "2px 7px", borderRadius: 6, background: "var(--green-soft)", color: "var(--green-deep)", fontWeight: 700 }}>L{student.level || 1}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, padding: "0 12px 14px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 6px", borderRadius: 10, background: "var(--bg)" }}>
            <span style={{ color: s.color, display: "inline-flex" }}>{s.icon}</span>
            <span className="mono" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: "var(--ink-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: "var(--line)" }}/>
      <div style={{ padding: "6px 8px" }}>
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href}
             style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }}
             onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
             onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <span style={{ color: "var(--ink-3)", display: "inline-flex" }}>{item.icon}</span>{item.label}
          </Link>
        ))}
      </div>
      <div style={{ height: 1, background: "var(--line)" }}/>
      <div style={{ padding: "6px 8px" }}>
        <button onClick={logout}
           style={{ width: "100%", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--rose)" }}
           onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rose-soft)")}
           onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
          <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}><Icon.Arrow/></span>Log out
        </button>
      </div>
    </div>
  );
};

export const Nav = () => {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfile] = useState(false);
  const student = useStudent();
  const activeId = NAV_ITEMS.find((i) => pathname.startsWith(i.match))?.id;

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(251,248,241,0.88)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 60 }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Logo/>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }} className="hidden sm:inline">Mathify</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }} className="hidden sm:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <Link key={item.id} href={item.href}
                 style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 13px", borderRadius: 10, fontWeight: 600, fontSize: 14, background: isActive ? "var(--ink)" : "transparent", color: isActive ? "var(--paper)" : "var(--ink-2)" }}>
                <span style={{ opacity: isActive ? 1 : 0.65, display: "inline-flex" }}>{item.icon}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <NotificationBell/>
          <div style={{ position: "relative" }}>
            <button onClick={() => setProfile((o) => !o)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", borderRadius: 999, border: profileOpen ? "1px solid var(--ink-3)" : "1px solid var(--line)", background: "var(--paper)", cursor: "pointer", fontFamily: "inherit" }}>
              <Avatar letter={student.initial || "S"} color="var(--green)" size={28}/>
              <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600 }}>{student.name || "Student"}</span>
            </button>
            {profileOpen && <ProfilePopover onClose={() => setProfile(false)}/>}
          </div>
          <button className="sm:hidden" onClick={() => setOpen((o) => !o)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-2)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {open ? <Icon.Close/> : <Icon.Menu/>}
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden" style={{ borderTop: "1px solid var(--line)", background: "rgba(251,248,241,0.97)", padding: "10px 16px 16px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId;
            return (
              <Link key={item.id} href={item.href} onClick={() => setOpen(false)}
                 style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600, background: isActive ? "var(--ink)" : "transparent", color: isActive ? "var(--paper)" : "var(--ink-2)" }}>
                {item.icon}{item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export const SectionHeader = ({ eyebrow, title, right }: { eyebrow: ReactNode; title: ReactNode; right?: ReactNode }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
    <div>
      <div className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 4 }}>{eyebrow}</div>
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
    </div>
    {right}
  </div>
);

export const CategorySearch = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div style={{ position: "relative", width: 240, flexShrink: 0 }}>
    <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", pointerEvents: "none", display: "flex" }}>
      <Icon.Search/>
    </span>
    <input
      type="text"
      placeholder={placeholder || "Search by category…"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "9px 12px 9px 35px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--paper)", fontSize: 13, fontFamily: "inherit", outline: "none", color: "var(--ink)" }}
      onFocus={(e) => (e.target.style.borderColor = "var(--ink-3)")}
      onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
    />
  </div>
);

export const StudentFooter = ({ label, links }: { label: string; links?: { label: string; href: string }[] }) => (
  <div style={{ paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)", flexWrap: "wrap", gap: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo/><span>Mathify · {label}</span></div>
    <div style={{ display: "flex", gap: 18 }}>
      {(links || []).map((l) => (
        <Link key={l.label} href={l.href} style={{ color: "var(--ink-3)" }}>{l.label}</Link>
      ))}
    </div>
  </div>
);

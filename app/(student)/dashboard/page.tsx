"use client";

import type { ReactNode } from "react";
import { Icon, Logo } from "@/app/(shared)/icons";
import { StatCardShell, StatLabel } from "@/app/(shared)/primitives";
import { useStudent } from "@/app/(shared)/student";

// NOTE: the backend has no dashboard endpoint yet (API_DOCUMENTATION.md covers
// auth/courses/quizzes only), so the figures below are the original static
// placeholders. Name / streak / xp / level come from the student context.

const Greeting = () => {
  const student = useStudent();
  return (
    <section style={{ position: "relative", padding: "36px 0 8px" }}>
      <span className="serif" style={{ position: "absolute", top: 24, right: "8%", fontSize: 64, color: "var(--amber)", opacity: 0.18, fontWeight: 600, pointerEvents: "none" }}>∑</span>
      <span className="serif" style={{ position: "absolute", bottom: 0, right: "24%", fontSize: 44, color: "var(--blue)", opacity: 0.16, fontWeight: 600, pointerEvents: "none" }}>π</span>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 32, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 640 }}>
          <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10 }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }).toUpperCase()} · DAY {student.streak || 1}
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
            Welcome back, {student.name || "there"}.{" "}
            <span className="serif" style={{ color: "var(--green-deep)", fontWeight: 500 }}>The chain rule</span>{" "}
            is waiting.
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 16, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: 540 }}>
            You&rsquo;re <b style={{ color: "var(--ink)" }}>72%</b> through today&rsquo;s goal
            {student.streak > 0 && <span> and on a <b style={{ color: "var(--ink)" }}>{student.streak}-day</b> streak</span>}.
            Three quick lessons and you&rsquo;re done.
          </p>
        </div>
      </div>
    </section>
  );
};

const UP_NEXT_COLORS = {
  amber: { bg: "var(--amber-soft)", fg: "var(--amber-deep)" },
  blue: { bg: "var(--blue-soft)", fg: "var(--blue-deep)" },
  plum: { bg: "var(--plum-soft)", fg: "var(--plum)" },
};

const UpNextRow = ({ tag, title, meta, color, icon }: { tag: string; title: string; meta: string; color: keyof typeof UP_NEXT_COLORS; icon: ReactNode }) => {
  const c = UP_NEXT_COLORS[color];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, background: "var(--bg)", border: "1px solid var(--line)", cursor: "pointer" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, color: c.fg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 700 }}>{tag}</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{meta}</div>
      </div>
      <Icon.Arrow style={{ color: "var(--ink-3)" }}/>
    </div>
  );
};

const ContinueCard = () => {
  const student = useStudent();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-[18px] mt-[28px]">
      <div style={{ position: "relative", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 24, padding: 28, boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
        <span className="serif" style={{ position: "absolute", top: -30, right: -10, fontSize: 220, color: "var(--green)", opacity: 0.07, fontWeight: 600, pointerEvents: "none", lineHeight: 1 }}>ƒ′</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, position: "relative" }}>
          <span style={{ padding: "5px 10px", borderRadius: 999, background: "var(--blue-soft)", color: "var(--blue-deep)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>PICK UP WHERE YOU LEFT OFF</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>· paused 18 min ago</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", marginBottom: 10, position: "relative" }}>
          <span>Level {student.level || 8} · Calculus</span><span>›</span><span>Derivatives</span><span>›</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>Lesson 03</span>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1, position: "relative" }}>The chain rule, intuitively</h2>
        <p style={{ margin: 0, fontSize: 15, color: "var(--ink-2)", lineHeight: 1.55, maxWidth: 520, position: "relative" }}>
          Functions inside functions — a nested gear system. Six minutes of reading, then four practice problems.
        </p>
        <div style={{ display: "flex", gap: 18, marginTop: 18, fontSize: 13, color: "var(--ink-3)", position: "relative" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.Clock/> 6 min read</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--amber-deep)" }}><Icon.Bolt/> +24 XP</span>
          <span>★★★☆☆ Intermediate</span>
        </div>
        <div style={{ marginTop: 22, padding: "18px 20px", borderRadius: 16, background: "var(--bg)", border: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 18, position: "relative" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-3)", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 6 }}>
              <span>STEP 3 OF 7</span><span>43% done</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5,6,7].map((n) => (
                <div key={n} style={{ flex: 1, height: 8, borderRadius: 999, background: n < 3 ? "var(--green)" : n === 3 ? "var(--blue)" : "var(--line)" }}/>
              ))}
            </div>
          </div>
          <button style={{ padding: "14px 22px", borderRadius: 12, border: "none", background: "var(--green)", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 2px 0 var(--green-deep), 0 8px 18px -6px rgba(31,138,91,0.5)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Continue <Icon.Arrow/>
          </button>
        </div>
      </div>
      <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 24, padding: 24, boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Up next today</h3>
          <a href="#" style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)" }}>See plan ↗</a>
        </div>
        <div style={{ display: "grid", gap: 10, flex: 1 }}>
          {([
            { tag: "04", title: "Practice: chain rule drills",        meta: "8 problems · 12 XP", color: "amber", icon: <Icon.Target/> },
            { tag: "05", title: "Video: visualising d/dx of sin(x²)", meta: "3:48 · 10 XP",       color: "blue",  icon: <Icon.Play/>   },
            { tag: "06", title: "Quick check: 5-question quiz",        meta: "5 min · 16 XP",      color: "plum",  icon: <Icon.Sparkle/>},
          ] as const).map((l) => <UpNextRow key={l.tag} {...l}/>)}
        </div>
        <button style={{ marginTop: 14, padding: 12, borderRadius: 12, border: "1px dashed var(--line)", background: "transparent", color: "var(--ink-2)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Icon.Plus/> Add a topic to today&rsquo;s plan
        </button>
      </div>
    </div>
  );
};

const StreakCard = () => {
  const student = useStudent();
  return (
    <StatCardShell>
      <StatLabel icon={<Icon.Flame/>} color="var(--amber-soft)" deep="var(--amber-deep)" label="STREAK"/>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{student.streak || 0}</span>
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>days</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 3, marginTop: 14 }}>
        {Array.from({ length: 14 }).map((_, i) => {
          const intensity = i < 3 ? 0.3 : i < 8 ? 0.6 : i < 13 ? 0.9 : 1;
          const today = i === 13;
          return <div key={i} style={{ flex: 1, height: 14 + intensity * 30, borderRadius: 4, background: today ? "var(--amber)" : `oklch(${0.95 - intensity * 0.32} 0.10 65)`, border: today ? "2px solid var(--amber-deep)" : "none" }}/>;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--ink-3)" }}>
        <span>2 weeks</span><span style={{ fontWeight: 600, color: "var(--amber-deep)" }}>1 freeze available</span>
      </div>
    </StatCardShell>
  );
};

const XPCard = () => {
  const student = useStudent();
  return (
    <StatCardShell>
      <StatLabel icon={<Icon.Bolt/>} color="var(--green-soft)" deep="var(--green-deep)" label="WEEKLY XP"/>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{student.xp > 0 ? student.xp.toLocaleString() : "0"}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--green-deep)" }}>+12%</span>
      </div>
      <svg viewBox="0 0 168 50" style={{ width: "100%", height: 50, marginTop: 14 }}>
        <path d="M0 40 L24 34 L48 32 L72 24 L96 27 L120 14 L144 10 L168 6" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M0 40 L24 34 L48 32 L72 24 L96 27 L120 14 L144 10 L168 6 L168 50 L0 50 Z" fill="var(--green)" opacity="0.12"/>
        <circle cx="168" cy="6" r="3.5" fill="var(--green)"/>
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--ink-3)" }}>
        <span>Mon</span><span>Sun</span>
      </div>
    </StatCardShell>
  );
};

const HeartsCard = () => (
  <StatCardShell>
    <StatLabel icon={<Icon.Heart/>} color="var(--rose-soft)" deep="var(--rose)" label="HEARTS"/>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>5</span>
      <span style={{ fontSize: 13, color: "var(--ink-3)" }}>/ 5 full</span>
    </div>
    <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
      {[1,2,3,4,5].map((i) => (
        <div key={i} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--rose-soft)", color: "var(--rose)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon.Heart/></div>
      ))}
    </div>
    <p style={{ margin: "auto 0 0", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>Wrong answers cost a heart. Refill by practicing easier topics, or wait 30 min.</p>
  </StatCardShell>
);

const GoalCard = () => {
  const pct = 72, r = 36, circ = 2 * Math.PI * r, offset = circ * (1 - pct / 100);
  return (
    <StatCardShell>
      <StatLabel icon={<Icon.Target/>} color="var(--blue-soft)" deep="var(--blue-deep)" label="DAILY GOAL"/>
      <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
        <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r={r} fill="none" stroke="var(--bg-2)" strokeWidth="10"/>
            <circle cx="48" cy="48" r={r} fill="none" stroke="var(--blue)" strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} transform="rotate(-90 48 48)"/>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>36</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>/ 50 XP</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>14 XP to go</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>One short lesson or a quick practice round will finish today.</div>
        </div>
      </div>
    </StatCardShell>
  );
};

const StatsRow = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px] mt-[18px]">
    <StreakCard/><XPCard/><HeartsCard/><GoalCard/>
  </div>
);

const QUEST_COLORS = {
  green: { bg: "var(--green-soft)", fg: "var(--green-deep)", bar: "var(--green)" },
  blue: { bg: "var(--blue-soft)", fg: "var(--blue-deep)", bar: "var(--blue)" },
  amber: { bg: "var(--amber-soft)", fg: "var(--amber-deep)", bar: "var(--amber)" },
  plum: { bg: "var(--plum-soft)", fg: "var(--plum)", bar: "var(--plum)" },
};

const QuestRow = ({ tag, color, title, meta, progress, total, reward }: { tag: string; color: keyof typeof QUEST_COLORS; title: string; meta: string; progress: number; total: number; reward: string }) => {
  const c = QUEST_COLORS[color], pct = Math.round((progress / total) * 100);
  return (
    <div style={{ padding: 16, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ padding: "3px 8px", borderRadius: 6, background: c.bg, color: c.fg, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>{tag}</span>
        <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: "auto" }}>{progress} / {total}</span>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{meta}</div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: c.bar }}/>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-2)" }}>
        <Icon.Sparkle style={{ color: c.fg }}/><span>Reward: <b>{reward}</b></span>
      </div>
    </div>
  );
};

const QuestsPanel = () => (
  <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 24, padding: 24, boxShadow: "var(--shadow-sm)" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em" }}>Quests</h3>
          <span style={{ padding: "3px 8px", borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-2)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>4 ACTIVE</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>Small targets that compound. Resets at midnight, weekly on Monday.</p>
      </div>
      <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "var(--blue-deep)" }}>All quests ↗</a>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
      {([
        { tag: "DAILY",  color: "green", title: "Finish today's plan",  meta: "Complete the 3 remaining steps",       progress: 4,  total: 7,  reward: "20 XP"         },
        { tag: "DAILY",  color: "amber", title: "Earn 50 XP today",      meta: "Any combination of lessons + practice", progress: 36, total: 50, reward: "+1 gem"        },
        { tag: "WEEKLY", color: "blue",  title: "Practice for 5 days",   meta: "3 of 5 done · ends Sunday",             progress: 3,  total: 5,  reward: "Streak Freeze" },
        { tag: "WEEKLY", color: "plum",  title: "Master one new node",   meta: "Algebra in progress",                   progress: 7,  total: 12, reward: "Achievement"   },
      ] as const).map((q, i) => <QuestRow key={i} {...q}/>)}
    </div>
  </div>
);

const ACHIEVEMENT_COLORS = {
  green: { bg: "var(--green-soft)", fg: "var(--green-deep)" },
  amber: { bg: "var(--amber-soft)", fg: "var(--amber-deep)" },
  blue: { bg: "var(--blue-soft)", fg: "var(--blue-deep)" },
  plum: { bg: "var(--plum-soft)", fg: "var(--plum)" },
};

const AchievementBadge = ({ name, desc, date, color, icon }: { name: string; desc: string; date: string; color: keyof typeof ACHIEVEMENT_COLORS; icon: ReactNode }) => {
  const c = ACHIEVEMENT_COLORS[color];
  return (
    <div style={{ padding: 14, borderRadius: 14, background: "var(--bg)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, color: c.fg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em" }}>{name}</div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{desc}</div>
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{date}</div>
    </div>
  );
};

const AchievementsCard = () => {
  const items = [
    { name: "Algebra Apprentice", desc: "Finished Basic Algebra",  date: "2 days ago",  color: "green", icon: <Icon.Trophy/> },
    { name: "30-Day Climber",     desc: "30 day streak reached",    date: "17 days ago", color: "amber", icon: <Icon.Flame/>  },
    { name: "Sharp Eye",          desc: "20 quick checks in a row", date: "last week",   color: "blue",  icon: <Icon.Target/> },
    { name: "Theorem Hunter",     desc: "50 lessons completed",     date: "3 wks ago",   color: "plum",  icon: <Icon.Star/>   },
  ] as const;
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 24, padding: 24, boxShadow: "var(--shadow-sm)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em" }}>Achievements</h3>
            <span style={{ padding: "3px 8px", borderRadius: 999, background: "var(--amber-soft)", color: "var(--amber-deep)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>12 EARNED</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>Badges for milestones, not for showing up.</p>
        </div>
        <a href="#" style={{ fontSize: 13, fontWeight: 600, color: "var(--blue-deep)" }}>Trophy case ↗</a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[14px]">
        {items.map((a, i) => <AchievementBadge key={i} {...a}/>)}
      </div>
      <div style={{ padding: 14, borderRadius: 14, background: "var(--bg)", border: "1px dashed var(--line)" }}>
        <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-3)", letterSpacing: "0.06em", marginBottom: 8 }}>NEXT UP</div>
        <div style={{ display: "flex", gap: 16 }}>
          {[{ name: "Calculus Cadet", req: "Finish Derivatives" }, { name: "100-Day Climber", req: "53 more days" }].map((l) => (
            <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-2)", color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon.Lock/></div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{l.req}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <main className="px-4 sm:px-6 lg:px-7 pb-20" style={{ maxWidth: 1280, margin: "0 auto" }}>
      <Greeting/>
      <ContinueCard/>
      <StatsRow/>
      <div className="mt-[18px]">
        <QuestsPanel/>
      </div>
      <div className="mt-[18px]">
        <AchievementsCard/>
      </div>
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo/><span>Mathify · v2.4 · last sync 2m ago</span></div>
        <div style={{ display: "flex", gap: 18 }}>
          <a href="#" style={{ color: "var(--ink-3)" }}>Help</a>
          <a href="#" style={{ color: "var(--ink-3)" }}>Settings</a>
          <a href="#" style={{ color: "var(--ink-3)" }}>What&rsquo;s new</a>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/(shared)/icons";
import { COLOR_MAP } from "@/app/(shared)/primitives";
import { SectionHeader, CategorySearch, StudentFooter } from "@/app/(shared)/chrome";
import { timeAgo } from "@/app/(shared)/format";
import { api, type CourseSummary, type Enrollment, ApiError } from "@/core/api";

// My Library — the student's enrolled courses. Joins the per-user enrollment
// feed (GET /api/students/me/enrollments → { courseId, status, progressPercent,
// lastAccessedAt }) with the course catalog (GET /api/courses) for the display
// fields. Real progress + completion state now drives the cards and tabs.

type EnrolledCourse = CourseSummary & {
  status: Enrollment["status"];
  progressPercent: number;
  lastAccessedAt: string | null;
};

const isComplete = (e: { status: string; progressPercent: number }) =>
  e.status === "COMPLETED" || e.progressPercent >= 100;

const CurrentFocus = ({ course }: { course: EnrolledCourse | null }) => {
  if (!course) {
    return (
      <div style={{ borderRadius: 20, border: "1.5px dashed var(--line)", background: "var(--paper)", padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginBottom: 36, flexWrap: "wrap" }}>
        <div>
          <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)", display: "block", marginBottom: 10 }}>YOUR CURRENT FOCUS</span>
          <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>Start your learning journey</h2>
          <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 14, maxWidth: 480, lineHeight: 1.55 }}>
            You haven&rsquo;t enrolled in any courses yet. Browse All Courses to begin.
          </p>
        </div>
        <Link href="/all-courses" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 12, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 14, boxShadow: "0 2px 0 var(--green-deep)" }}>
          Browse courses <Icon.Arrow/>
        </Link>
      </div>
    );
  }

  const c = COLOR_MAP[course.color] || COLOR_MAP.green;
  const pct = Math.round(course.progressPercent);
  const opened = timeAgo(course.lastAccessedAt);
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "var(--ink)", color: "var(--paper)", borderRadius: 24, padding: "28px 32px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 32, boxShadow: "var(--shadow-md)", marginBottom: 36 }}>
      <span className="serif" style={{ position: "absolute", right: -24, top: -64, fontSize: 300, lineHeight: 1, color: c.solid, opacity: 0.15, fontWeight: 600, pointerEvents: "none", userSelect: "none" }}>{course.glyph}</span>
      <div style={{ position: "relative" }}>
        <span className="mono" style={{ display: "inline-block", padding: "4px 10px", background: "rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 14 }}>
          YOUR CURRENT FOCUS{opened ? ` · OPENED ${opened.toUpperCase()}` : ""}
        </span>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15 }}>{course.title}</h2>
        <p style={{ margin: 0, color: "rgba(255,253,247,0.65)", fontSize: 14, maxWidth: 420, lineHeight: 1.55 }}>{course.description}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
          <Link href={`/courses/${course.id}`} style={{ padding: "11px 20px", borderRadius: 12, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 0 var(--green-deep)" }}>
            Resume course <Icon.Arrow/>
          </Link>
        </div>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,253,247,0.6)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>
            <span>{isComplete(course) ? "COMPLETED" : "PROGRESS"}</span><span>{pct}%</span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: isComplete(course) ? "var(--green)" : c.solid, borderRadius: 999 }}/>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,253,247,0.65)" }}>
            <Icon.Book/> {course.totalLessons} lessons
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,253,247,0.65)" }}>
            <Icon.Clock/> {course.estimatedHours}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--amber)" }}>
            <Icon.Bolt/> {course.xpReward} XP
          </span>
        </div>
      </div>
    </div>
  );
};

const LibraryCard = ({ course }: { course: EnrolledCourse }) => {
  const c = COLOR_MAP[course.color] || COLOR_MAP.green;
  const done = isComplete(course);
  const pct = Math.round(course.progressPercent);
  return (
    <Link href={`/courses/${course.id}`}
       style={{ display: "flex", flexDirection: "column", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)", textDecoration: "none" }}>
      <div style={{ position: "relative", height: 110, background: c.bg, overflow: "hidden", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "flex-end", padding: "0 16px 12px" }}>
        <span className="serif" style={{ position: "absolute", right: 10, top: -24, fontSize: 140, color: c.deep, opacity: 0.18, fontWeight: 600, lineHeight: 1, pointerEvents: "none" }}>{course.glyph}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          <span className="mono" style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,253,247,0.7)", backdropFilter: "blur(4px)", fontSize: 11, fontWeight: 700, color: c.deep }}>
            {course.track.toUpperCase()}
          </span>
          <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 5, background: done ? "var(--green-soft)" : "var(--amber-soft)", color: done ? "var(--green-deep)" : "var(--amber-deep)" }}>
            {done ? <><Icon.Check/> COMPLETE</> : "IN PROGRESS"}
          </span>
        </div>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25 }}>{course.title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.45, flex: 1 }}>{course.description}</p>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-3)", marginBottom: 4 }}>
            <span>{done ? "COMPLETED" : "IN PROGRESS"}</span><span>{pct}%</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "var(--bg-2)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: done ? "var(--green)" : c.solid, borderRadius: 999 }}/>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--line)", marginTop: 4 }}>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-3)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon.Book/> {course.totalLessons}</span>
            {course.lastAccessedAt && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon.Clock/> {timeAgo(course.lastAccessedAt)}</span>}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: c.deep, display: "inline-flex", alignItems: "center", gap: 4 }}>
            {done ? "Review" : "Continue"} <Icon.Arrow/>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function MyLibraryPage() {
  const [enrolled, setEnrolled] = useState<EnrolledCourse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"progress" | "completed">("progress");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([api.listEnrollments(), api.listCourses()])
      .then(([enrollments, courses]) => {
        if (!alive) return;
        const byId = new Map(courses.map((c) => [c.id, c]));
        const joined = enrollments
          .map((e): EnrolledCourse | null => {
            const course = byId.get(e.courseId);
            return course ? { ...course, status: e.status, progressPercent: e.progressPercent, lastAccessedAt: e.lastAccessedAt } : null;
          })
          .filter((e): e is EnrolledCourse => e !== null)
          // most-recently-accessed first; never-opened courses sink to the bottom
          .sort((a, b) => (b.lastAccessedAt ? Date.parse(b.lastAccessedAt) : 0) - (a.lastAccessedAt ? Date.parse(a.lastAccessedAt) : 0));
        setEnrolled(joined);
      })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load your library."); });
    return () => { alive = false; };
  }, []);

  const all = enrolled ?? [];
  const inProgress = all.filter((e) => !isComplete(e));
  const completed = all.filter(isComplete);
  const list = tab === "progress" ? inProgress : completed;
  const shown = query.trim() ? list.filter((c) => c.track.toLowerCase().includes(query.toLowerCase())) : list;

  const tabBtn = (id: "progress" | "completed", label: string, count: number) => (
    <button onClick={() => setTab(id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13, background: tab === id ? "var(--ink)" : "transparent", color: tab === id ? "var(--paper)" : "var(--ink-2)" }}>
      {label}
      <span className="mono" style={{ fontSize: 11, opacity: tab === id ? 0.55 : 0.7 }}>{count}</span>
    </button>
  );

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)" }}>
          MY LIBRARY{enrolled ? ` · ${all.length} ENROLLED` : ""}
        </span>
        <h1 style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          Your courses, <span className="serif" style={{ color: "var(--green-deep)" }}>in progress</span>.
        </h1>
      </div>

      {error ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--rose)", fontSize: 14 }}>{error}</div>
      ) : !enrolled ? (
        <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--ink-3)", fontSize: 14 }}>Loading your library…</div>
      ) : (
        <>
          <CurrentFocus course={inProgress[0] ?? all[0] ?? null}/>

          <div style={{ marginBottom: 48 }}>
            <SectionHeader
              eyebrow={`MY LIBRARY · ${all.length} ENROLLED`}
              title="My Library"
              right={
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <CategorySearch value={query} onChange={setQuery}/>
                  <div style={{ display: "inline-flex", padding: 4, gap: 2, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12 }}>
                    {tabBtn("progress", "In Progress", inProgress.length)}
                    {tabBtn("completed", "Completed", completed.length)}
                  </div>
                </div>
              }
            />
            {all.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", borderRadius: 20, border: "1.5px dashed var(--line)", background: "var(--paper)", color: "var(--ink-3)", fontSize: 14 }}>
                You aren&rsquo;t enrolled in any courses yet.{" "}
                <Link href="/all-courses" style={{ color: "var(--green-deep)", fontWeight: 700 }}>Browse All Courses →</Link>
              </div>
            ) : shown.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--ink-3)", fontSize: 14 }}>
                {query.trim()
                  ? `No ${tab === "progress" ? "in-progress" : "completed"} courses match “${query}”.`
                  : (tab === "progress" ? "No courses in progress right now." : "You haven't completed any courses yet. Keep going!")}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                {shown.map((c) => <LibraryCard key={c.id} course={c}/>)}
              </div>
            )}
          </div>
        </>
      )}

      <StudentFooter label="My Library" links={[
        { label: "Browse all courses", href: "/all-courses" },
        { label: "Back to dashboard",  href: "/dashboard" },
      ]}/>
    </main>
  );
}

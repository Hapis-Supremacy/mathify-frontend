"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/(shared)/icons";
import { COLOR_MAP } from "@/app/(shared)/primitives";
import { SectionHeader, CategorySearch, StudentFooter } from "@/app/(shared)/chrome";
import { api, type CourseSummary, ApiError } from "@/core/api";

// All Courses catalog. Data is the real GET /api/courses feed.
// NOTE: the API doesn't expose per-user enrollment state or an enroll action
// yet, so every card links through to the course detail page; the old
// "Enroll" form (POST /course/enroll) is deferred until those endpoints exist.

const AllCourseCard = ({ course }: { course: CourseSummary }) => {
  const c = COLOR_MAP[course.color] || COLOR_MAP.green;
  return (
    <Link href={`/courses/${course.id}`} style={{ display: "flex", flexDirection: "column", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--shadow-sm)", textDecoration: "none" }}>
      <div style={{ position: "relative", height: 120, background: c.bg, overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
        <span className="serif" style={{ position: "absolute", left: 14, top: -24, fontSize: 160, color: c.deep, opacity: 0.2, fontWeight: 600, lineHeight: 1, pointerEvents: "none" }}>{course.glyph}</span>
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
          {course.status === "new" && (
            <span style={{ padding: "4px 10px", borderRadius: 999, background: "var(--ink)", color: "var(--paper)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>NEW</span>
          )}
        </div>
        <div style={{ position: "absolute", left: 14, bottom: 12 }}>
          <span className="mono" style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(255,253,247,0.7)", backdropFilter: "blur(4px)", fontSize: 11, fontWeight: 700, color: c.deep }}>
            {course.track.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div>
          <h3 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25 }}>{course.title}</h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.45 }}>{course.description}</p>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--ink-3)", marginTop: "auto" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon.Book/> {course.totalLessons} lessons</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon.Clock/> {course.estimatedHours}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--amber-deep)" }}><Icon.Bolt/> {course.xpReward} XP</span>
        </div>
        <div style={{ paddingTop: 10, borderTop: "1px solid var(--line)" }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "11px 16px", borderRadius: 12, background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 700, fontSize: 13 }}>
            View course <Icon.Arrow/>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    api.listCourses()
      .then((data) => { if (alive) setCourses(data); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load courses."); });
    return () => { alive = false; };
  }, []);

  const all = courses ?? [];
  const filtered = query.trim()
    ? all.filter((c) => c.track.toLowerCase().includes(query.toLowerCase()))
    : all;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)" }}>
          COURSE CATALOG{courses ? ` · ${all.length} COURSES` : ""}
        </span>
        <h1 style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          Every topic, <span className="serif" style={{ color: "var(--green-deep)" }}>your way</span>.
        </h1>
      </div>

      <div style={{ marginBottom: 48 }}>
        <SectionHeader
          eyebrow={`ALL COURSES${courses ? ` · ${all.length} AVAILABLE` : ""}`}
          title="All Courses"
          right={<CategorySearch value={query} onChange={setQuery}/>}
        />
        {error ? (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--rose)", fontSize: 14 }}>{error}</div>
        ) : !courses ? (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--ink-3)", fontSize: 14 }}>Loading courses…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--ink-3)", fontSize: 14 }}>
            {query.trim() ? <>No courses found for &ldquo;{query}&rdquo;.</> : "No courses available yet."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {filtered.map((c) => <AllCourseCard key={c.id} course={c}/>)}
          </div>
        )}
      </div>

      <StudentFooter label="All Courses" links={[
        { label: "My library",        href: "/courses" },
        { label: "Back to dashboard", href: "/dashboard" },
      ]}/>
    </main>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/(shared)/icons";
import { api, type CourseDetail, ApiError } from "@/core/api";

// Course detail, wired to GET /api/courses/{id}. The detail response only
// carries title/description/category/prerequisite/chapters — there is no
// lesson-level or progress data in the API yet, so each chapter links through
// to its modules page rather than reproducing the old hard-coded curriculum.

export default function CourseDetailPage({ params }: { params: Promise<{ course_id: string }> }) {
  const { course_id } = use(params);
  // key by course_id so state resets cleanly when navigating between courses.
  return <CourseDetailView key={course_id} course_id={course_id} />;
}

function CourseDetailView({ course_id }: { course_id: string }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    api.getCourse(course_id)
      .then((data) => { if (alive) setCourse(data); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? { status: e.status, message: e.message } : { message: "Could not load this course." }); });
    return () => { alive = false; };
  }, [course_id]);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 28px 80px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-3)", marginBottom: 20 }}>
        <Link href="/courses" style={{ color: "var(--ink-3)", fontWeight: 600 }}>Library</Link>
        <span>›</span>
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>{course?.title ?? "Course"}</span>
      </nav>

      {error ? (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--ink-3)" }}>
          <div style={{ color: error.status === 404 ? "var(--ink)" : "var(--rose)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {error.status === 404 ? "Course not found" : error.status === 401 ? "Please sign in to view this course" : "Something went wrong"}
          </div>
          <p style={{ fontSize: 14, margin: "0 0 18px" }}>{error.message}</p>
          <Link href="/all-courses" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 14 }}>
            Browse all courses <Icon.Arrow/>
          </Link>
        </div>
      ) : !course ? (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--ink-3)", fontSize: 14 }}>Loading course…</div>
      ) : (
        <>
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "var(--ink)", color: "var(--paper)", padding: "36px 40px", boxShadow: "var(--shadow-lg)", marginBottom: 28 }}>
            <span className="serif" style={{ position: "absolute", right: -20, top: -60, fontSize: 320, lineHeight: 1, color: "var(--green)", opacity: 0.12, fontWeight: 600, pointerEvents: "none" }}>ƒ′</span>
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span className="mono" style={{ padding: "4px 10px", background: "rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>{course.category.toUpperCase()}</span>
              </div>
              <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px,3vw,38px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{course.title}</h1>
              <p style={{ margin: "0 0 24px", color: "rgba(255,253,247,0.72)", fontSize: 15, lineHeight: 1.6, maxWidth: 520 }}>{course.description}</p>
              <div style={{ display: "flex", gap: 18, fontSize: 13, color: "rgba(255,253,247,0.6)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.Book/> {course.chapters.length} chapters</span>
              </div>
              {course.chapters.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <Link href={`/courses/${course.courseId}/${course.chapters[0].chapterId}/modules`} style={{ padding: "13px 22px", borderRadius: 13, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 0 var(--green-deep)" }}>
                    Start course <Icon.Arrow/>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {course.prerequisite.length > 0 && (
            <div style={{ marginBottom: 28, padding: "16px 20px", borderRadius: 16, background: "var(--amber-soft)", border: "1px solid var(--amber)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--amber-deep)" }}>Prerequisites:</span>
              {course.prerequisite.map((p) => (
                <Link key={p} href={`/courses/${p}`} className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--amber-deep)", textDecoration: "underline" }}>{p}</Link>
              ))}
            </div>
          )}

          <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, letterSpacing: "-0.015em" }}>Chapters</h2>
          {course.chapters.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 24px", color: "var(--ink-3)", fontSize: 14, border: "1.5px dashed var(--line)", borderRadius: 18 }}>
              No chapters published yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {course.chapters.map((ch, i) => (
                <Link key={ch.chapterId} href={`/courses/${course.courseId}/${ch.chapterId}/modules`}
                   style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 18, background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)", textDecoration: "none" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--green-soft)", color: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span className="mono" style={{ fontWeight: 800, fontSize: 13 }}>{i + 1}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{ch.title}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{ch.chapterId}</div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--green-deep)" }}>
                    Open <Icon.Arrow/>
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
            <span>Mathify · Course</span>
            <Link href="/courses" style={{ color: "var(--ink-3)" }}>Back to library</Link>
          </div>
        </>
      )}
    </main>
  );
}

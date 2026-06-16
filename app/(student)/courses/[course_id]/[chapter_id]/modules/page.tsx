"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/(shared)/icons";
import { api, type CourseDetail, ApiError } from "@/core/api";

// Chapter modules landing. The API has no lesson/module endpoint yet, so this
// derives the chapter title from GET /api/courses/{id} and routes through to
// the chapter quiz. The module list is a placeholder pending a backend feed.
export default function ChapterModulesPage({ params }: { params: Promise<{ course_id: string; chapter_id: string }> }) {
  const { course_id, chapter_id } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.getCourse(course_id)
      .then((data) => { if (alive) setCourse(data); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load this chapter."); });
    return () => { alive = false; };
  }, [course_id]);

  const chapter = course?.chapters.find((c) => c.chapterId === chapter_id);
  const chapterIndex = course ? course.chapters.findIndex((c) => c.chapterId === chapter_id) : -1;

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "28px 28px 80px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-3)", marginBottom: 20, flexWrap: "wrap" }}>
        <Link href="/courses" style={{ color: "var(--ink-3)", fontWeight: 600 }}>Library</Link>
        <span>›</span>
        <Link href={`/courses/${course_id}`} style={{ color: "var(--ink-3)", fontWeight: 600 }}>{course?.title ?? "Course"}</Link>
        <span>›</span>
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>{chapter?.title ?? "Chapter"}</span>
      </nav>

      {error ? (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--rose)", fontSize: 14 }}>{error}</div>
      ) : !course ? (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--ink-3)", fontSize: 14 }}>Loading chapter…</div>
      ) : !chapter ? (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Chapter not found</div>
          <Link href={`/courses/${course_id}`} style={{ color: "var(--green-deep)", fontWeight: 700 }}>Back to course</Link>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 28 }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)" }}>
              CHAPTER {chapterIndex + 1}
            </span>
            <h1 style={{ margin: "6px 0 0", fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{chapter.title}</h1>
          </div>

          <div style={{ padding: "20px 22px", borderRadius: 18, background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Icon.Book/>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Lessons</span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-3)", lineHeight: 1.55 }}>
              Module content for this chapter isn&rsquo;t available from the API yet. Once the lessons endpoint lands,
              the reading, video and practice steps will appear here.
            </p>
          </div>

          <Link href={`/courses/${course_id}/${chapter_id}/quizzez`}
             style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 18, background: "var(--ink)", color: "var(--paper)", textDecoration: "none", boxShadow: "var(--shadow-md)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon.Target/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Chapter quiz</div>
              <div style={{ fontSize: 13, color: "rgba(255,253,247,0.65)" }}>Check what you&rsquo;ve learned</div>
            </div>
            <Icon.Arrow/>
          </Link>
        </>
      )}
    </main>
  );
}

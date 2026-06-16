"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/(shared)/icons";
import { api, type Quiz, ApiError } from "@/core/api";

// Chapter quiz, wired to GET /api/quizzes/{id}. The [chapter_id] route segment
// is used as the quiz id. NOTE: the API returns question prompts/points/type
// but NOT the answer options, and there is no submit endpoint — so this renders
// the quiz overview; interactive answering is deferred until the backend
// exposes options + a grading endpoint.

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
};

export default function QuizPage({ params }: { params: Promise<{ course_id: string; chapter_id: string }> }) {
  const { course_id, chapter_id } = use(params);
  // key by chapter_id (the quiz id) so state resets when navigating between quizzes.
  return <QuizView key={chapter_id} course_id={course_id} chapter_id={chapter_id} />;
}

function QuizView({ course_id, chapter_id }: { course_id: string; chapter_id: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);

  useEffect(() => {
    let alive = true;
    api.getQuiz(chapter_id)
      .then((data) => { if (alive) setQuiz(data); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? { status: e.status, message: e.message } : { message: "Could not load this quiz." }); });
    return () => { alive = false; };
  }, [chapter_id]);

  const totalPoints = quiz?.questions.reduce((a, q) => a + q.points, 0) ?? 0;

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "28px 28px 80px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-3)", marginBottom: 20, flexWrap: "wrap" }}>
        <Link href={`/courses/${course_id}`} style={{ color: "var(--ink-3)", fontWeight: 600 }}>Course</Link>
        <span>›</span>
        <Link href={`/courses/${course_id}/${chapter_id}/modules`} style={{ color: "var(--ink-3)", fontWeight: 600 }}>Chapter</Link>
        <span>›</span>
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>Quiz</span>
      </nav>

      {error ? (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--ink-3)" }}>
          <div style={{ color: error.status === 404 ? "var(--ink)" : "var(--rose)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            {error.status === 404 ? "Quiz not found" : error.status === 401 ? "Please sign in to take this quiz" : "Something went wrong"}
          </div>
          <p style={{ fontSize: 14, margin: "0 0 18px" }}>{error.message}</p>
          <Link href={`/courses/${course_id}/${chapter_id}/modules`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 14 }}>
            Back to chapter <Icon.Arrow/>
          </Link>
        </div>
      ) : !quiz ? (
        <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--ink-3)", fontSize: 14 }}>Loading quiz…</div>
      ) : (
        <>
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "var(--ink)", color: "var(--paper)", padding: "32px 36px", boxShadow: "var(--shadow-lg)", marginBottom: 28 }}>
            <span className="serif" style={{ position: "absolute", right: -10, top: -50, fontSize: 240, lineHeight: 1, color: "var(--rose)", opacity: 0.14, fontWeight: 600, pointerEvents: "none" }}>?</span>
            <div style={{ position: "relative" }}>
              <span className="mono" style={{ padding: "4px 10px", background: "rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>QUIZ</span>
              <h1 style={{ margin: "14px 0 18px", fontSize: "clamp(24px,3vw,34px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{quiz.title}</h1>
              <div style={{ display: "flex", gap: 22, fontSize: 13, color: "rgba(255,253,247,0.7)", flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.Target/> {quiz.questions.length} questions</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--amber)" }}><Icon.Bolt/> {totalPoints} points</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Icon.Check/> Pass: {quiz.passingScore}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {quiz.questions.map((q, i) => (
              <div key={q.questionId} style={{ padding: "18px 20px", borderRadius: 16, background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 999, background: "var(--bg-2)", color: "var(--ink-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--rose-soft)", color: "var(--rose)", fontSize: 11, fontWeight: 700 }}>{TYPE_LABEL[q.type] || q.type}</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--amber-deep)", fontWeight: 700 }}>{q.points} pts</span>
                </div>
                <p style={{ margin: 0, fontSize: 15, color: "var(--ink)", lineHeight: 1.5 }}>{q.prompt}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: "14px 18px", borderRadius: 14, background: "var(--amber-soft)", border: "1px solid var(--amber)", fontSize: 13, color: "var(--amber-deep)", lineHeight: 1.5 }}>
            Answer choices and scoring aren&rsquo;t available from the API yet — this is a read-only preview of the quiz.
          </div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
            <span>Mathify · Quiz</span>
            <Link href={`/courses/${course_id}/${chapter_id}/modules`} style={{ color: "var(--ink-3)" }}>Back to chapter</Link>
          </div>
        </>
      )}
    </main>
  );
}

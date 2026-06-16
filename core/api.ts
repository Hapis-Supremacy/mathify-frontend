// Typed client for the Mathify JAX-RS backend (see API_DOCUMENTATION.md).
//
// All requests are same-origin to `/api/*` and proxied to the backend by the
// rewrite in next.config.ts. That keeps the JSESSIONID session cookie working
// without CORS, so every call sends `credentials: "include"`.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api";

export type Role = "STUDENT" | "ADMIN" | (string & {});

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  track: string;
  level: string;
  levelNum: number;
  color: string;
  glyph: string;
  totalLessons: number;
  estimatedHours: string;
  xpReward: number;
  status: string;
}

export interface CourseChapter {
  chapterId: string;
  title: string;
}

export interface CourseDetail {
  courseId: string;
  title: string;
  description: string;
  category: string;
  prerequisite: string[];
  chapters: CourseChapter[];
}

export type QuizQuestionType = "MULTIPLE_CHOICE" | (string & {});

export interface QuizQuestion {
  questionId: string;
  prompt: string;
  points: number;
  type: QuizQuestionType;
}

export interface Quiz {
  quizId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface LoginResponse {
  role: Role;
  message: string;
}

/** Current user's profile + progress, reshaped by the backend MeResource. */
export interface Me {
  name: string;
  initial: string;
  streak: number;
  xp: number;
  level: number;
}

export type EnrollmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | (string & {});

/** One of the current student's course enrollments (StudentResource). */
export interface Enrollment {
  courseId: string;
  status: EnrollmentStatus;
  /** ISO-8601 timestamp of the last access, or null if never opened. */
  lastAccessedAt: string | null;
  /** 0–100, computed from chapter_progress / chapters. */
  progressPercent: number;
}

/** A course as a node in the prerequisite graph (CourseResource /paths). */
export interface CourseNode {
  id: string;
  title: string;
  track: string;
  levelNum: number;
  /** Raw CSS color (e.g. "#1f8a5b"); "" when the backend has none. */
  color: string;
  /** Display glyph; "" when null. */
  glyph: string;
}

/** A directed prerequisite edge: complete `from` before `to`. */
export interface PrereqEdge {
  from: string;
  to: string;
}

/** GET /courses/paths — the whole prerequisite DAG. */
export interface PrereqGraph {
  nodes: CourseNode[];
  edges: PrereqEdge[];
}

/** GET /courses/paths?courseId=X — ordered path (prereqs first, target last). */
export interface LearningPath {
  target: string;
  path: CourseNode[];
}

export interface ApiErrorBody {
  error: string;
  details?: string;
}

/** Thrown for any non-2xx response; carries the HTTP status + backend message. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ApiErrorBody;
      message = body.details || body.error || message;
    } catch {
      /* non-JSON error body — keep the status message */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  /** Exchange a Firebase ID token for a backend session; returns the user's role. */
  login: (idToken: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  /** Current user's profile + progress (requires a session). */
  getMe: () => request<Me>("/me"),
  listCourses: () => request<CourseSummary[]>("/courses"),
  /** The current student's enrollments with per-course progress. */
  listEnrollments: () => request<Enrollment[]>("/students/me/enrollments"),
  getCourse: (id: string) => request<CourseDetail>(`/courses/${encodeURIComponent(id)}`),
  /** The whole prerequisite DAG (every course as a node). */
  getPrereqGraph: () => request<PrereqGraph>("/courses/paths"),
  /** The ordered prerequisite path leading up to one course. */
  getLearningPath: (courseId: string) =>
    request<LearningPath>(`/courses/paths?courseId=${encodeURIComponent(courseId)}`),
  getQuiz: (id: string) => request<Quiz>(`/quizzes/${encodeURIComponent(id)}`),
};

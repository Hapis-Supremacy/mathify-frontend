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

// --- Admin CRUD (see ADMIN_API_PROPOSAL.md; backend implementation pending) ---

/** Body for creating/updating a course. `totalLessons` is server-computed. */
export interface CourseInput {
  title: string;
  description: string;
  category: string;
  level: string;
  levelNum: number;
  color: string;
  glyph?: string;
  estimatedHours?: string;
  xpReward?: number;
  status?: string;
  prerequisite?: string[];
}

export interface ChapterInput {
  title: string;
  order?: number;
}

/** Chapter summary in a chapter list (POST response / list endpoints). */
export interface ChapterSummary {
  chapterId: string;
  title: string;
  order?: number;
}

/** Quiz summary in the per-chapter list (no questions). */
export interface QuizSummary {
  quizId: string;
  title: string;
  passingScore: number;
  questionCount: number;
}

export interface QuizInput {
  title: string;
  passingScore: number;
}

/** One answer choice. `correct` is only present for ADMIN reads. */
export interface QuestionOption {
  text: string;
  correct: boolean;
}

export interface QuestionInput {
  prompt: string;
  points: number;
  type: QuizQuestionType;
  options: QuestionOption[];
}

/** A question as returned to an admin — includes the answer options. */
export interface QuestionAdmin extends QuizQuestion {
  options: QuestionOption[];
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

  /**
   * Admin CRUD against ADMIN_API_PROPOSAL.md. These endpoints are not yet live
   * on the backend — calls reject with ApiError until they are implemented.
   */
  admin: {
    createCourse: (body: CourseInput) =>
      request<CourseDetail>("/courses", { method: "POST", body: JSON.stringify(body) }),
    updateCourse: (id: string, body: CourseInput) =>
      request<CourseDetail>(`/courses/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteCourse: (id: string) =>
      request<void>(`/courses/${encodeURIComponent(id)}`, { method: "DELETE" }),

    createChapter: (courseId: string, body: ChapterInput) =>
      request<ChapterSummary>(`/courses/${encodeURIComponent(courseId)}/chapters`, { method: "POST", body: JSON.stringify(body) }),
    updateChapter: (courseId: string, chapterId: string, body: ChapterInput) =>
      request<ChapterSummary>(`/courses/${encodeURIComponent(courseId)}/chapters/${encodeURIComponent(chapterId)}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteChapter: (courseId: string, chapterId: string) =>
      request<void>(`/courses/${encodeURIComponent(courseId)}/chapters/${encodeURIComponent(chapterId)}`, { method: "DELETE" }),

    listQuizzes: (chapterId: string) =>
      request<QuizSummary[]>(`/chapters/${encodeURIComponent(chapterId)}/quizzes`),
    createQuiz: (chapterId: string, body: QuizInput) =>
      request<Quiz>(`/chapters/${encodeURIComponent(chapterId)}/quizzes`, { method: "POST", body: JSON.stringify(body) }),
    updateQuiz: (quizId: string, body: QuizInput) =>
      request<Quiz>(`/quizzes/${encodeURIComponent(quizId)}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteQuiz: (quizId: string) =>
      request<void>(`/quizzes/${encodeURIComponent(quizId)}`, { method: "DELETE" }),

    createQuestion: (quizId: string, body: QuestionInput) =>
      request<QuestionAdmin>(`/quizzes/${encodeURIComponent(quizId)}/questions`, { method: "POST", body: JSON.stringify(body) }),
    updateQuestion: (quizId: string, questionId: string, body: QuestionInput) =>
      request<QuestionAdmin>(`/quizzes/${encodeURIComponent(quizId)}/questions/${encodeURIComponent(questionId)}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteQuestion: (quizId: string, questionId: string) =>
      request<void>(`/quizzes/${encodeURIComponent(quizId)}/questions/${encodeURIComponent(questionId)}`, { method: "DELETE" }),
  },
};

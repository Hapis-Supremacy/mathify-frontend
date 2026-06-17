# Admin CRUD API — Proposal

> Proposed contract for the Mathify admin console. Base URL `/api`, version v1.
> **Status: PROPOSAL** — frontend is built against this; backend to implement.
> Companion to [API_DOCUMENTATION.md](API_DOCUMENTATION.md) (existing read endpoints).

## Table of Contents
- [Conventions](#conventions)
- [Authorization](#authorization)
- [Open questions for the backend team](#open-questions-for-the-backend-team)
- [Courses](#courses)
- [Chapters](#chapters)
- [Quizzes](#quizzes)
- [Questions](#questions)

## Conventions
- **Content negotiation:** `Content-Type: application/json`, `Accept: application/json`.
- **Auth:** session cookie (`JSESSIONID`) established by `POST /api/auth/login`. All
  endpoints below are `@Secured` and additionally require the `ADMIN` role.
- **IDs:** server-generated and returned in the create response body. The client
  never invents IDs. Existing IDs are human-readable slugs (`c-k2`, `ch-k2-u1`,
  `q-l-k2-u1-1`); the server may keep that scheme or switch to opaque IDs — the
  frontend treats every ID as an opaque string.
- **Timestamps:** ISO-8601 (`2026-06-17T08:30:00Z`) where present.
- **Errors:** reuse the existing `ErrorResponse` shape and status codes from
  [API_DOCUMENTATION.md](API_DOCUMENTATION.md#error-responses). Relevant additions:

  | Status | Condition |
  |--------|-----------|
  | `403`  | Authenticated but not an `ADMIN` |
  | `409`  | Conflict — e.g. deleting a course that still has chapters, or a duplicate slug |

## Authorization
`POST /api/auth/login` already returns `role`. The admin console only renders for
`role === "ADMIN"`; the server must still enforce the role on every mutation
(never trust the client). A non-admin session hitting these endpoints gets `403`.

## Open questions for the backend team
1. **`track` vs `category`.** The course *summary* exposes `track`, the course
   *detail* exposes `category`. The create/update body below sends a single
   `category` and assumes the server derives `track` from it. Confirm or split.
2. **`totalLessons`** is treated as **server-computed** (count of chapters /
   lessons) and is therefore *not* accepted in the create/update body.
3. **Question answer options.** The current read API (`GET /api/quizzes/{id}`)
   returns `prompt/points/type` but **no options**. Authoring requires options +
   which one is correct. This proposal adds an `options[]` array to the question
   body, and asks that the admin-authenticated `GET` include `options` (with the
   `correct` flag) so the edit form can prefill. The student-facing response must
   keep hiding the `correct` flag.
4. **Cascade vs block on delete.** Default proposed: deleting a parent that still
   has children returns `409` (block). If you prefer cascade delete, say so and
   the confirm dialog copy will change accordingly.

---

## Courses

### `POST /api/courses`
Create a course.

**Request Body** (`CourseInput`):
```json
{
  "title": "Early Elementary Math (K-2)",
  "description": "Early Math curriculum",
  "category": "Early Math",
  "level": "Beginner",
  "levelNum": 1,
  "color": "green",
  "glyph": "∑",
  "estimatedHours": "5h",
  "xpReward": 1000,
  "status": "new",
  "prerequisite": []
}
```

| Field          | Type     | Required | Validation / Notes |
|----------------|----------|----------|--------------------|
| title          | String   | Yes      | NotBlank |
| description    | String   | Yes      | NotBlank |
| category       | String   | Yes      | Maps to summary `track` (see open question 1) |
| level          | String   | Yes      | e.g. `Beginner` / `Intermediate` / `Advanced` |
| levelNum       | Integer  | Yes      | >= 1 |
| color          | String   | Yes      | One of `green` `blue` `plum` `amber` `rose` |
| glyph          | String   | No       | Single display glyph |
| estimatedHours | String   | No       | Free text, e.g. `5h` |
| xpReward       | Integer  | No       | >= 0, default 0 |
| status         | String   | No       | `new` / `active` / `draft`, default `draft` |
| prerequisite   | String[] | No       | Array of existing course IDs |

**Response — `201 Created`:** the full `CourseDetail` (as in the read API) plus
the generated `courseId`. `totalLessons` starts at 0.

| Status | Condition |
|--------|-----------|
| 400 | Validation failed |
| 403 | Not an admin |
| 409 | Prerequisite course ID does not exist / duplicate slug |

### `PUT /api/courses/{courseId}`
Update a course. Body is the same `CourseInput` (full replace). Returns
`200 OK` with the updated `CourseDetail`. `404` if not found.

### `DELETE /api/courses/{courseId}`
Delete a course. `204 No Content` on success. `404` if not found. `409` if it
still has chapters (unless cascade is chosen — see open question 4).

---

## Chapters
Chapters belong to a course. The existing `GET /api/courses/{courseId}` already
returns the `chapters[]` array, so the admin console reuses it to **list**
chapters — no new GET needed.

### `POST /api/courses/{courseId}/chapters`
**Request Body** (`ChapterInput`):
```json
{ "title": "Counting and Cardinality", "order": 1 }
```

| Field | Type    | Required | Notes |
|-------|---------|----------|-------|
| title | String  | Yes      | NotBlank |
| order | Integer | No       | Display position; server may auto-append if omitted |

**Response — `201 Created`:**
```json
{ "chapterId": "ch-k2-u1", "title": "Counting and Cardinality", "order": 1 }
```
`404` if the course does not exist.

### `PUT /api/courses/{courseId}/chapters/{chapterId}`
Update a chapter. Body = `ChapterInput`. `200 OK` with the updated chapter.

### `DELETE /api/courses/{courseId}/chapters/{chapterId}`
`204 No Content`. `409` if the chapter still has quizzes (unless cascade).

---

## Quizzes
Quizzes belong to a chapter.

### `GET /api/chapters/{chapterId}/quizzes`  *(new — list)*
Lists the quizzes in a chapter (summary form, no questions):
```json
[
  { "quizId": "q-l-k2-u1-1", "title": "Exercises: Counting to 10", "passingScore": 2, "questionCount": 5 }
]
```

> `GET /api/quizzes/{id}` (existing) still returns a single quiz **with**
> `questions[]`. For an admin session it must additionally include each
> question's `options[]` with `correct` flags (see Questions below).

### `POST /api/chapters/{chapterId}/quizzes`
**Request Body** (`QuizInput`):
```json
{ "title": "Exercises: Counting to 10", "passingScore": 2 }
```

| Field        | Type    | Required | Notes |
|--------------|---------|----------|-------|
| title        | String  | Yes      | NotBlank |
| passingScore | Integer | Yes      | >= 0 |

**Response — `201 Created`:** the created quiz (with empty `questions[]`).
`404` if the chapter does not exist.

### `PUT /api/quizzes/{quizId}`
Update quiz metadata (title, passingScore). Body = `QuizInput`. `200 OK`.

### `DELETE /api/quizzes/{quizId}`
`204 No Content`. Deletes the quiz and its questions.

---

## Questions
Questions belong to a quiz.

### `POST /api/quizzes/{quizId}/questions`
**Request Body** (`QuestionInput`):
```json
{
  "prompt": "If you have 4 apples and 3 bananas, how many fruits in total?",
  "points": 10,
  "type": "MULTIPLE_CHOICE",
  "options": [
    { "text": "7", "correct": true },
    { "text": "1", "correct": false },
    { "text": "12", "correct": false },
    { "text": "43", "correct": false }
  ]
}
```

| Field    | Type             | Required | Validation / Notes |
|----------|------------------|----------|--------------------|
| prompt   | String           | Yes      | NotBlank |
| points   | Integer          | Yes      | >= 0 |
| type     | String           | Yes      | `MULTIPLE_CHOICE` (only type for now) |
| options  | Option[]         | Yes\*    | Required for `MULTIPLE_CHOICE`; >= 2 options, exactly 1 with `correct: true` |

**Option** = `{ "text": String (NotBlank), "correct": Boolean }`.

**Response — `201 Created`:** the created question including its generated
`questionId` and the `options[]` (with `correct`). `404` if the quiz is missing.

### `PUT /api/quizzes/{quizId}/questions/{questionId}`
Update a question. Body = `QuestionInput` (full replace, including options).
`200 OK` with the updated question.

### `DELETE /api/quizzes/{quizId}/questions/{questionId}`
`204 No Content`. `404` if not found.

---

## Endpoint summary

| Method | Path | Purpose |
|--------|------|---------|
| POST   | `/api/courses` | Create course |
| PUT    | `/api/courses/{courseId}` | Update course |
| DELETE | `/api/courses/{courseId}` | Delete course |
| POST   | `/api/courses/{courseId}/chapters` | Create chapter |
| PUT    | `/api/courses/{courseId}/chapters/{chapterId}` | Update chapter |
| DELETE | `/api/courses/{courseId}/chapters/{chapterId}` | Delete chapter |
| GET    | `/api/chapters/{chapterId}/quizzes` | List quizzes in chapter |
| POST   | `/api/chapters/{chapterId}/quizzes` | Create quiz |
| PUT    | `/api/quizzes/{quizId}` | Update quiz |
| DELETE | `/api/quizzes/{quizId}` | Delete quiz |
| POST   | `/api/quizzes/{quizId}/questions` | Create question |
| PUT    | `/api/quizzes/{quizId}/questions/{questionId}` | Update question |
| DELETE | `/api/quizzes/{quizId}/questions/{questionId}` | Delete question |

> Existing reads reused by the admin console: `GET /api/courses`,
> `GET /api/courses/{id}` (chapters list), `GET /api/quizzes/{id}` (questions list).

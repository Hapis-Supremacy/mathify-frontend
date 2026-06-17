"use client";

import { useEffect, useState, type ReactNode, type CSSProperties, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/core/firebase";
import { Logo } from "@/app/(shared)/icons";
import { Avatar } from "@/app/(shared)/primitives";
import { clearStoredRole } from "@/app/(shared)/auth";
import { notify, Toast } from "@/app/(shared)/toast";
import {
  api, ApiError,
  type CourseSummary, type CourseInput,
  type CourseChapter, type ChapterInput,
  type QuizSummary, type QuizInput,
  type QuizQuestion, type QuestionAdmin, type QuestionInput, type QuestionOption,
} from "@/core/api";
import "./styles.css";

// Admin console — content authoring. CRUD over the full curriculum hierarchy:
// Courses → Chapters → Quizzes → Questions, via the api.admin.* client. Those
// endpoints are proposed in ADMIN_API_PROPOSAL.md and not live on the backend
// yet, so reads/writes surface a loading/error/toast until the backend lands.

const ADMIN = { name: "Admin", role: "Owner", initial: "A" };

const Icon = {
  Plus:    (p: SVGProps<SVGSVGElement>) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Arrow:   (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Chevron: (p: SVGProps<SVGSVGElement>) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Book:    (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M3 3H7C7.5 3 8 3.5 8 4V13C8 12.5 7.5 12 7 12H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 3H9C8.5 3 8 3.5 8 4V13C8 12.5 8.5 12 9 12H13V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Layers:  (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M8 1.5L14.5 5L8 8.5L1.5 5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M2 8L8 11.2L14 8M2 11L8 14.2L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Target:  (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Help:    (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M6.2 6.2C6.2 5.2 7 4.6 8 4.6C9 4.6 9.8 5.2 9.8 6.1C9.8 7.4 8 7.4 8 8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="11" r="0.6" fill="currentColor"/></svg>,
  Pencil:  (p: SVGProps<SVGSVGElement>) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M9.5 2.5L11.5 4.5L5 11L2.5 11.5L3 9L9.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  Trash:   (p: SVGProps<SVGSVGElement>) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M2.5 4H11.5M5 4V2.8C5 2.4 5.3 2 5.8 2H8.2C8.7 2 9 2.4 9 2.8V4M3.5 4L4 11.2C4 11.6 4.4 12 4.8 12H9.2C9.6 12 10 11.6 10 11.2L10.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  X:       (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Check:   (p: SVGProps<SVGSVGElement>) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none" {...p}><path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Bell:    (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M4 7C4 4.8 5.8 3 8 3C10.2 3 12 4.8 12 7V10L13 11.5H3L4 10V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M6.5 12.5C6.5 13.3 7.2 14 8 14C8.8 14 9.5 13.3 9.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  Moon:    (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M12 10.5A5.5 5.5 0 0 1 5.5 4c0-.42.05-.83.14-1.22A5.5 5.5 0 1 0 13.22 10.36 5.53 5.53 0 0 1 12 10.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Sun:     (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><circle cx="8" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.4"/><path d="M8 2V1M8 15V14M2 8H1M15 8H14M3.76 3.76L3.05 3.05M12.95 12.95L12.24 12.24M12.24 3.76L12.95 3.05M3.05 12.95L3.76 12.24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  Logout:  (p: SVGProps<SVGSVGElement>) => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...p}><path d="M6 2.5H3.5C2.9 2.5 2.5 2.9 2.5 3.5V12.5C2.5 13.1 2.9 13.5 3.5 13.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 11L13 8L9.5 5M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

const COLOR_OPTIONS = ["green", "blue", "plum", "amber", "rose"] as const;
const COURSE_COLOR: Record<string, string> = {
  green: "var(--green)", blue: "var(--blue)", plum: "var(--plum)", amber: "var(--amber)", rose: "var(--rose)",
};

// ---------------------------------------------------------------- primitives

const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ borderRadius: "var(--radius)", background: "var(--paper)", border: "1px solid var(--line)", boxShadow: "var(--shadow-sm)", ...style }}>{children}</div>
);

type BtnKind = "primary" | "ghost" | "danger";
const BTN: Record<BtnKind, CSSProperties> = {
  primary: { background: "var(--accent)", border: "1px solid var(--accent-deep)", color: "white" },
  ghost:   { background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-2)" },
  danger:  { background: "var(--rose-soft)", border: "1px solid var(--rose)", color: "var(--rose-deep)" },
};
const Button = ({ kind = "ghost", children, onClick, disabled, type = "button", style }: { kind?: BtnKind; children: ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit"; style?: CSSProperties }) => (
  <button type={type} onClick={onClick} disabled={disabled}
    style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit", opacity: disabled ? 0.55 : 1, ...BTN[kind], ...style }}>
    {children}
  </button>
);

const IconButton = ({ title, onClick, danger, children }: { title: string; onClick: () => void; danger?: boolean; children: ReactNode }) => (
  <button title={title} onClick={onClick}
    style={{ width: 30, height: 30, borderRadius: 8, cursor: "pointer", border: "1px solid var(--line)", background: "var(--paper)", color: danger ? "var(--rose-deep)" : "var(--ink-3)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
    {children}
  </button>
);

const thStyle: CSSProperties = { textAlign: "left", padding: "10px 16px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--ink-3)", textTransform: "uppercase" };
const tdStyle: CSSProperties = { padding: "13px 16px", fontSize: 13, verticalAlign: "middle" };

// --- form fields -----------------------------------------------------------

const inputStyle: CSSProperties = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 10, border: "1px solid var(--line)", background: "var(--paper-2)", color: "var(--ink)", fontSize: 13.5, fontFamily: "inherit", outline: "none" };

const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>{label}</span>
    {children}
    {hint && <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{hint}</span>}
  </label>
);

const TextInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle}/>
);
const NumberInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <input type="number" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} style={inputStyle}/>
);
const TextArea = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }}/>
);
const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

// --- modal -----------------------------------------------------------------

const Modal = ({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer: ReactNode; wide?: boolean }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,22,15,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 20px", overflowY: "auto" }}>
    <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: wide ? 620 : 480, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 18, boxShadow: "var(--shadow-md)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
        <IconButton title="Close" onClick={onClose}><Icon.X/></IconButton>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "14px 20px", borderTop: "1px solid var(--line)" }}>{footer}</div>
    </div>
  </div>
);

// Generic confirm-delete dialog.
const ConfirmDelete = ({ label, busy, onCancel, onConfirm }: { label: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) => (
  <Modal title="Delete" onClose={onCancel} footer={<>
    <Button kind="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
    <Button kind="danger" onClick={onConfirm} disabled={busy}><Icon.Trash/>{busy ? "Deleting…" : "Delete"}</Button>
  </>}>
    <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>
      Delete <b>{label}</b>? This can&rsquo;t be undone, and any nested content is removed too.
    </p>
  </Modal>
);

// A small wrapper that runs an async submit, tracking a saving flag + errors.
function useSubmit(onDone: () => void) {
  const [busy, setBusy] = useState(false);
  const run = (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true);
    fn()
      .then(() => { notify(okMsg); onDone(); })
      .catch((e: unknown) => notify(e instanceof ApiError ? e.message : "Something went wrong"))
      .finally(() => setBusy(false));
  };
  return { busy, run };
}

// --------------------------------------------------------------- entity forms

const emptyCourse: CourseInput = { title: "", description: "", category: "", level: "Beginner", levelNum: 1, color: "green", glyph: "", estimatedHours: "", xpReward: 0, status: "draft", prerequisite: [] };

const CourseForm = ({ initial, busy, onCancel, onSubmit }: { initial?: CourseInput; busy: boolean; onCancel: () => void; onSubmit: (v: CourseInput) => void }) => {
  const [v, setV] = useState<CourseInput>(initial ?? emptyCourse);
  const [prereqText, setPrereqText] = useState((initial?.prerequisite ?? []).join(", "));
  const set = (patch: Partial<CourseInput>) => setV((p) => ({ ...p, ...patch }));
  const valid = v.title.trim() && v.description.trim() && v.category.trim();
  const submit = () => onSubmit({ ...v, prerequisite: prereqText.split(",").map((s) => s.trim()).filter(Boolean) });
  return (
    <Modal title={initial ? "Edit course" : "New course"} wide onClose={onCancel} footer={<>
      <Button kind="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
      <Button kind="primary" onClick={submit} disabled={busy || !valid}><Icon.Check/>{busy ? "Saving…" : "Save course"}</Button>
    </>}>
      <Field label="Title"><TextInput value={v.title} onChange={(t) => set({ title: t })} placeholder="Algebra Foundations"/></Field>
      <Field label="Description"><TextArea value={v.description} onChange={(t) => set({ description: t })} placeholder="What this course covers"/></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Category"><TextInput value={v.category} onChange={(t) => set({ category: t })} placeholder="Algebra"/></Field>
        <Field label="Level"><Select value={v.level} onChange={(t) => set({ level: t })} options={["Beginner", "Intermediate", "Advanced"]}/></Field>
        <Field label="Level number"><NumberInput value={v.levelNum} onChange={(n) => set({ levelNum: n })}/></Field>
        <Field label="Status"><Select value={v.status ?? "draft"} onChange={(t) => set({ status: t })} options={["draft", "new", "active"]}/></Field>
        <Field label="Color"><Select value={v.color} onChange={(t) => set({ color: t })} options={COLOR_OPTIONS}/></Field>
        <Field label="Glyph"><TextInput value={v.glyph ?? ""} onChange={(t) => set({ glyph: t })} placeholder="∑"/></Field>
        <Field label="Estimated hours"><TextInput value={v.estimatedHours ?? ""} onChange={(t) => set({ estimatedHours: t })} placeholder="5h"/></Field>
        <Field label="XP reward"><NumberInput value={v.xpReward ?? 0} onChange={(n) => set({ xpReward: n })}/></Field>
      </div>
      <Field label="Prerequisites" hint="Comma-separated course IDs, e.g. c-k2, c-35"><TextInput value={prereqText} onChange={setPrereqText} placeholder="c-k2, c-35"/></Field>
    </Modal>
  );
};

const ChapterForm = ({ initial, busy, onCancel, onSubmit }: { initial?: ChapterInput; busy: boolean; onCancel: () => void; onSubmit: (v: ChapterInput) => void }) => {
  const [v, setV] = useState<ChapterInput>(initial ?? { title: "", order: undefined });
  return (
    <Modal title={initial ? "Edit chapter" : "New chapter"} onClose={onCancel} footer={<>
      <Button kind="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
      <Button kind="primary" onClick={() => onSubmit(v)} disabled={busy || !v.title.trim()}><Icon.Check/>{busy ? "Saving…" : "Save chapter"}</Button>
    </>}>
      <Field label="Title"><TextInput value={v.title} onChange={(t) => setV((p) => ({ ...p, title: t }))} placeholder="Counting and Cardinality"/></Field>
      <Field label="Order" hint="Optional display position"><NumberInput value={v.order ?? 0} onChange={(n) => setV((p) => ({ ...p, order: n }))}/></Field>
    </Modal>
  );
};

const QuizForm = ({ initial, busy, onCancel, onSubmit }: { initial?: QuizInput; busy: boolean; onCancel: () => void; onSubmit: (v: QuizInput) => void }) => {
  const [v, setV] = useState<QuizInput>(initial ?? { title: "", passingScore: 1 });
  return (
    <Modal title={initial ? "Edit quiz" : "New quiz"} onClose={onCancel} footer={<>
      <Button kind="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
      <Button kind="primary" onClick={() => onSubmit(v)} disabled={busy || !v.title.trim()}><Icon.Check/>{busy ? "Saving…" : "Save quiz"}</Button>
    </>}>
      <Field label="Title"><TextInput value={v.title} onChange={(t) => setV((p) => ({ ...p, title: t }))} placeholder="Exercises: Counting to 10"/></Field>
      <Field label="Passing score"><NumberInput value={v.passingScore} onChange={(n) => setV((p) => ({ ...p, passingScore: n }))}/></Field>
    </Modal>
  );
};

const blankOption = (): QuestionOption => ({ text: "", correct: false });

const QuestionForm = ({ initial, busy, onCancel, onSubmit }: { initial?: QuestionInput; busy: boolean; onCancel: () => void; onSubmit: (v: QuestionInput) => void }) => {
  const [v, setV] = useState<QuestionInput>(initial ?? { prompt: "", points: 10, type: "MULTIPLE_CHOICE", options: [blankOption(), blankOption()] });
  const setOption = (i: number, patch: Partial<QuestionOption>) =>
    setV((p) => ({ ...p, options: p.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) }));
  const setCorrect = (i: number) =>
    setV((p) => ({ ...p, options: p.options.map((o, j) => ({ ...o, correct: j === i })) }));
  const addOption = () => setV((p) => ({ ...p, options: [...p.options, blankOption()] }));
  const removeOption = (i: number) => setV((p) => ({ ...p, options: p.options.filter((_, j) => j !== i) }));
  const validOptions = v.options.filter((o) => o.text.trim()).length >= 2 && v.options.some((o) => o.correct);
  const valid = v.prompt.trim() && validOptions;
  return (
    <Modal title={initial ? "Edit question" : "New question"} wide onClose={onCancel} footer={<>
      <Button kind="ghost" onClick={onCancel} disabled={busy}>Cancel</Button>
      <Button kind="primary" onClick={() => onSubmit(v)} disabled={busy || !valid}><Icon.Check/>{busy ? "Saving…" : "Save question"}</Button>
    </>}>
      <Field label="Prompt"><TextArea value={v.prompt} onChange={(t) => setV((p) => ({ ...p, prompt: t }))} placeholder="If you have 4 apples and 3 bananas…"/></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Points"><NumberInput value={v.points} onChange={(n) => setV((p) => ({ ...p, points: n }))}/></Field>
        <Field label="Type"><Select value={v.type} onChange={(t) => setV((p) => ({ ...p, type: t }))} options={["MULTIPLE_CHOICE"]}/></Field>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)" }}>Answer options <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>· select the correct one</span></span>
        {v.options.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <input type="radio" name="correct" checked={o.correct} onChange={() => setCorrect(i)} title="Mark correct" style={{ width: 16, height: 16, accentColor: "var(--green)", flexShrink: 0 }}/>
            <input value={o.text} onChange={(e) => setOption(i, { text: e.target.value })} placeholder={`Option ${i + 1}`} style={{ ...inputStyle, flex: 1 }}/>
            <IconButton title="Remove option" danger onClick={() => removeOption(i)}><Icon.X/></IconButton>
          </div>
        ))}
        <Button kind="ghost" onClick={addOption} style={{ alignSelf: "flex-start", padding: "6px 11px", fontSize: 12 }}><Icon.Plus/>Add option</Button>
      </div>
    </Modal>
  );
};

// ----------------------------------------------------------- list scaffolding

const StateRow = ({ children }: { children: ReactNode }) => (
  <div style={{ textAlign: "center", padding: "44px 24px", color: "var(--ink-3)", fontSize: 14 }}>{children}</div>
);

const Toolbar = ({ title, sub, onAdd, addLabel }: { title: string; sub: string; onAdd: () => void; addLabel: string }) => (
  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, padding: "4px 0 18px" }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h1>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--ink-3)" }}>{sub}</p>
    </div>
    <Button kind="primary" onClick={onAdd}><Icon.Plus/>{addLabel}</Button>
  </div>
);

const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <Card style={{ overflow: "hidden" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "var(--paper-2)", borderBottom: "1px solid var(--line)" }}>
          {head.map((h, i) => <th key={i} style={{ ...thStyle, textAlign: i === head.length - 1 ? "right" : "left" }}>{h}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </Card>
);

const Actions = ({ onOpen, openLabel, onEdit, onDelete }: { onOpen?: () => void; openLabel?: string; onEdit: () => void; onDelete: () => void }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 7, justifyContent: "flex-end" }}>
    {onOpen && <Button kind="ghost" onClick={onOpen} style={{ padding: "6px 11px", fontSize: 12 }}>{openLabel} <Icon.Chevron/></Button>}
    <IconButton title="Edit" onClick={onEdit}><Icon.Pencil/></IconButton>
    <IconButton title="Delete" danger onClick={onDelete}><Icon.Trash/></IconButton>
  </div>
);

type Nav =
  | { level: "courses" }
  | { level: "chapters"; course: Crumb }
  | { level: "quizzes"; course: Crumb; chapter: Crumb }
  | { level: "questions"; course: Crumb; chapter: Crumb; quiz: Crumb };
type Crumb = { id: string; title: string };

// ------------------------------------------------------------------ levels

const CoursesLevel = ({ onOpen }: { onOpen: (c: Crumb) => void }) => {
  const [rows, setRows] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState<{ id?: string; initial?: CourseInput } | null>(null);
  const [del, setDel] = useState<CourseSummary | null>(null);
  const reload = () => setVersion((n) => n + 1);
  const submit = useSubmit(() => { setForm(null); reload(); });
  const remove = useSubmit(() => { setDel(null); reload(); });

  useEffect(() => {
    let alive = true;
    api.listCourses()
      .then((d) => { if (alive) { setRows(d); setError(null); } })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load courses."); });
    return () => { alive = false; };
  }, [version]);

  const openEdit = async (row: CourseSummary) => {
    let prerequisite: string[] = [];
    let category = row.track;
    try { const d = await api.getCourse(row.id); prerequisite = d.prerequisite; category = d.category; } catch { /* fall back to summary */ }
    setForm({ id: row.id, initial: { title: row.title, description: row.description, category, level: row.level, levelNum: row.levelNum, color: row.color, glyph: row.glyph, estimatedHours: row.estimatedHours, xpReward: row.xpReward, status: row.status, prerequisite } });
  };

  return (
    <>
      <Toolbar title="Courses" sub={rows ? `${rows.length} course${rows.length === 1 ? "" : "s"} · manage the curriculum` : "Manage the curriculum"} addLabel="New course" onAdd={() => setForm({})}/>
      {error ? <StateRow><span style={{ color: "var(--rose-deep)" }}>{error}</span></StateRow>
        : !rows ? <StateRow>Loading courses…</StateRow>
        : rows.length === 0 ? <StateRow>No courses yet. Create the first one.</StateRow>
        : (
          <Table head={["Course", "Level", "Status", "XP", "Lessons", "Actions"]}>
            {rows.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <td style={tdStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `color-mix(in srgb, ${COURSE_COLOR[c.color] ?? "var(--green)"} 16%, var(--paper))`, color: COURSE_COLOR[c.color] ?? "var(--green)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{c.glyph || <Icon.Book/>}</span>
                    <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 700 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{c.track} · <span className="mono">{c.id}</span></div>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>{c.level}</td>
                <td style={tdStyle}><span style={{ padding: "3px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "var(--bg-2)", color: "var(--ink-2)" }}>{c.status}</span></td>
                <td className="tnum" style={tdStyle}>{c.xpReward}</td>
                <td className="tnum" style={tdStyle}>{c.totalLessons}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <Actions openLabel="Chapters" onOpen={() => onOpen({ id: c.id, title: c.title })} onEdit={() => openEdit(c)} onDelete={() => setDel(c)}/>
                </td>
              </tr>
            ))}
          </Table>
        )}
      {form && <CourseForm initial={form.initial} busy={submit.busy} onCancel={() => setForm(null)}
        onSubmit={(v) => submit.run(() => form.id ? api.admin.updateCourse(form.id, v) : api.admin.createCourse(v), form.id ? "Course updated" : "Course created")}/>}
      {del && <ConfirmDelete label={del.title} busy={remove.busy} onCancel={() => setDel(null)}
        onConfirm={() => remove.run(() => api.admin.deleteCourse(del.id), "Course deleted")}/>}
    </>
  );
};

const ChaptersLevel = ({ course, onOpen }: { course: Crumb; onOpen: (c: Crumb) => void }) => {
  const [rows, setRows] = useState<CourseChapter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState<{ id?: string; initial?: ChapterInput } | null>(null);
  const [del, setDel] = useState<CourseChapter | null>(null);
  const reload = () => setVersion((n) => n + 1);
  const submit = useSubmit(() => { setForm(null); reload(); });
  const remove = useSubmit(() => { setDel(null); reload(); });

  useEffect(() => {
    let alive = true;
    api.getCourse(course.id)
      .then((d) => { if (alive) { setRows(d.chapters); setError(null); } })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load chapters."); });
    return () => { alive = false; };
  }, [course.id, version]);

  return (
    <>
      <Toolbar title="Chapters" sub={`Inside ${course.title}`} addLabel="New chapter" onAdd={() => setForm({})}/>
      {error ? <StateRow><span style={{ color: "var(--rose-deep)" }}>{error}</span></StateRow>
        : !rows ? <StateRow>Loading chapters…</StateRow>
        : rows.length === 0 ? <StateRow>No chapters yet. Add the first one.</StateRow>
        : (
          <Table head={["#", "Chapter", "ID", "Actions"]}>
            {rows.map((ch, i) => (
              <tr key={ch.chapterId} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <td className="tnum" style={{ ...tdStyle, color: "var(--ink-3)", width: 40 }}>{i + 1}</td>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{ch.title}</td>
                <td className="mono" style={{ ...tdStyle, color: "var(--ink-3)", fontSize: 12 }}>{ch.chapterId}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <Actions openLabel="Quizzes" onOpen={() => onOpen({ id: ch.chapterId, title: ch.title })} onEdit={() => setForm({ id: ch.chapterId, initial: { title: ch.title } })} onDelete={() => setDel(ch)}/>
                </td>
              </tr>
            ))}
          </Table>
        )}
      {form && <ChapterForm initial={form.initial} busy={submit.busy} onCancel={() => setForm(null)}
        onSubmit={(v) => submit.run(() => form.id ? api.admin.updateChapter(course.id, form.id, v) : api.admin.createChapter(course.id, v), form.id ? "Chapter updated" : "Chapter created")}/>}
      {del && <ConfirmDelete label={del.title} busy={remove.busy} onCancel={() => setDel(null)}
        onConfirm={() => remove.run(() => api.admin.deleteChapter(course.id, del.chapterId), "Chapter deleted")}/>}
    </>
  );
};

const QuizzesLevel = ({ chapter, onOpen }: { chapter: Crumb; onOpen: (c: Crumb) => void }) => {
  const [rows, setRows] = useState<QuizSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState<{ id?: string; initial?: QuizInput } | null>(null);
  const [del, setDel] = useState<QuizSummary | null>(null);
  const reload = () => setVersion((n) => n + 1);
  const submit = useSubmit(() => { setForm(null); reload(); });
  const remove = useSubmit(() => { setDel(null); reload(); });

  useEffect(() => {
    let alive = true;
    api.admin.listQuizzes(chapter.id)
      .then((d) => { if (alive) { setRows(d); setError(null); } })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load quizzes."); });
    return () => { alive = false; };
  }, [chapter.id, version]);

  return (
    <>
      <Toolbar title="Quizzes" sub={`Inside ${chapter.title}`} addLabel="New quiz" onAdd={() => setForm({})}/>
      {error ? <StateRow><span style={{ color: "var(--rose-deep)" }}>{error}</span></StateRow>
        : !rows ? <StateRow>Loading quizzes…</StateRow>
        : rows.length === 0 ? <StateRow>No quizzes yet. Add the first one.</StateRow>
        : (
          <Table head={["Quiz", "Passing score", "Questions", "Actions"]}>
            {rows.map((q, i) => (
              <tr key={q.quizId} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--line-2)" : "none" }}>
                <td style={{ ...tdStyle, fontWeight: 700 }}>{q.title}<div className="mono" style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 400 }}>{q.quizId}</div></td>
                <td className="tnum" style={tdStyle}>{q.passingScore}</td>
                <td className="tnum" style={tdStyle}>{q.questionCount}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <Actions openLabel="Questions" onOpen={() => onOpen({ id: q.quizId, title: q.title })} onEdit={() => setForm({ id: q.quizId, initial: { title: q.title, passingScore: q.passingScore } })} onDelete={() => setDel(q)}/>
                </td>
              </tr>
            ))}
          </Table>
        )}
      {form && <QuizForm initial={form.initial} busy={submit.busy} onCancel={() => setForm(null)}
        onSubmit={(v) => submit.run(() => form.id ? api.admin.updateQuiz(form.id, v) : api.admin.createQuiz(chapter.id, v), form.id ? "Quiz updated" : "Quiz created")}/>}
      {del && <ConfirmDelete label={del.title} busy={remove.busy} onCancel={() => setDel(null)}
        onConfirm={() => remove.run(() => api.admin.deleteQuiz(del.quizId), "Quiz deleted")}/>}
    </>
  );
};

const QuestionsLevel = ({ quiz }: { quiz: Crumb }) => {
  const [rows, setRows] = useState<QuizQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [form, setForm] = useState<{ id?: string; initial?: QuestionInput } | null>(null);
  const [del, setDel] = useState<QuizQuestion | null>(null);
  const reload = () => setVersion((n) => n + 1);
  const submit = useSubmit(() => { setForm(null); reload(); });
  const remove = useSubmit(() => { setDel(null); reload(); });

  useEffect(() => {
    let alive = true;
    api.getQuiz(quiz.id)
      .then((d) => { if (alive) { setRows(d.questions); setError(null); } })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load questions."); });
    return () => { alive = false; };
  }, [quiz.id, version]);

  const openEdit = (q: QuizQuestion) => {
    const options = (q as QuestionAdmin).options ?? [blankOption(), blankOption()];
    setForm({ id: q.questionId, initial: { prompt: q.prompt, points: q.points, type: q.type, options } });
  };

  return (
    <>
      <Toolbar title="Questions" sub={`Inside ${quiz.title}`} addLabel="New question" onAdd={() => setForm({})}/>
      {error ? <StateRow><span style={{ color: "var(--rose-deep)" }}>{error}</span></StateRow>
        : !rows ? <StateRow>Loading questions…</StateRow>
        : rows.length === 0 ? <StateRow>No questions yet. Add the first one.</StateRow>
        : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((q, i) => {
              const options = (q as QuestionAdmin).options ?? [];
              return (
                <Card key={q.questionId} style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: "var(--bg-2)", color: "var(--ink-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--plum-soft)", color: "var(--plum-deep)", fontSize: 11, fontWeight: 700 }}>{q.type}</span>
                        <span className="mono" style={{ fontSize: 11, color: "var(--amber-deep)", fontWeight: 700 }}>{q.points} pts</span>
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, lineHeight: 1.45 }}>{q.prompt}</p>
                      {options.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {options.map((o, j) => (
                            <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: o.correct ? "var(--green-soft)" : "var(--bg-2)", color: o.correct ? "var(--green-deep)" : "var(--ink-3)" }}>
                              {o.correct && <Icon.Check/>}{o.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "inline-flex", gap: 7, flexShrink: 0 }}>
                      <IconButton title="Edit" onClick={() => openEdit(q)}><Icon.Pencil/></IconButton>
                      <IconButton title="Delete" danger onClick={() => setDel(q)}><Icon.Trash/></IconButton>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      {form && <QuestionForm initial={form.initial} busy={submit.busy} onCancel={() => setForm(null)}
        onSubmit={(v) => submit.run(() => form.id ? api.admin.updateQuestion(quiz.id, form.id, v) : api.admin.createQuestion(quiz.id, v), form.id ? "Question updated" : "Question created")}/>}
      {del && <ConfirmDelete label="this question" busy={remove.busy} onCancel={() => setDel(null)}
        onConfirm={() => remove.run(() => api.admin.deleteQuestion(quiz.id, del.questionId), "Question deleted")}/>}
    </>
  );
};

// --------------------------------------------------------------------- chrome

const TopBar = ({ dark, onToggleDark }: { dark: boolean; onToggleDark: () => void }) => {
  const router = useRouter();
  const logout = async () => {
    try { await api.logout(); } catch { /* ignore — clear client state regardless */ }
    try { await signOut(getFirebaseAuth()); } catch { /* ignore */ }
    clearStoredRole();
    router.push("/login");
    router.refresh();
  };
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "color-mix(in srgb, var(--bg) 85%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 28px", display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <Logo/>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>Mathify</div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>ADMIN CONSOLE</div>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <button onClick={onToggleDark} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-2)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }} title={dark ? "Switch to light mode" : "Switch to dark mode"}>
          {dark ? <Icon.Sun/> : <Icon.Moon/>}
        </button>
        <button style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-2)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }} title="Notifications">
          <Icon.Bell/>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", borderRadius: 999, border: "1px solid var(--line)", background: "var(--paper)" }}>
          <Avatar letter={ADMIN.initial} color="var(--plum)" size={26}/>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{ADMIN.name}</div>
            <div style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{ADMIN.role}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--rose-deep)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }} title="Log out">
          <Icon.Logout/>
        </button>
      </div>
    </header>
  );
};

const CRUMB_ICON = { courses: <Icon.Book/>, chapters: <Icon.Layers/>, quizzes: <Icon.Target/>, questions: <Icon.Help/> } as const;

const Breadcrumbs = ({ nav, go }: { nav: Nav; go: (n: Nav) => void }) => {
  const trail: { label: string; nav: Nav; icon: ReactNode }[] = [{ label: "Courses", nav: { level: "courses" }, icon: CRUMB_ICON.courses }];
  if (nav.level !== "courses") trail.push({ label: nav.course.title, nav: { level: "chapters", course: nav.course }, icon: CRUMB_ICON.chapters });
  if (nav.level === "quizzes" || nav.level === "questions") trail.push({ label: nav.chapter.title, nav: { level: "quizzes", course: nav.course, chapter: nav.chapter }, icon: CRUMB_ICON.quizzes });
  if (nav.level === "questions") trail.push({ label: nav.quiz.title, nav, icon: CRUMB_ICON.questions });
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", padding: "22px 0 6px", fontSize: 13 }}>
      {trail.map((t, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span style={{ color: "var(--ink-3)" }}><Icon.Chevron/></span>}
            <button onClick={() => !last && go(t.nav)} disabled={last}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px", borderRadius: 8, border: "1px solid", borderColor: last ? "var(--line)" : "transparent", background: last ? "var(--paper)" : "transparent", color: last ? "var(--ink)" : "var(--ink-3)", fontWeight: last ? 700 : 600, cursor: last ? "default" : "pointer", fontFamily: "inherit", fontSize: 13, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t.icon}{t.label}
            </button>
          </span>
        );
      })}
    </nav>
  );
};

const Footer = () => (
  <div style={{ marginTop: 40, paddingTop: 22, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Logo/><span>Mathify Admin · content authoring</span></div>
    <div style={{ display: "flex", gap: 18 }}><a href="#" style={{ color: "var(--ink-3)" }}>Docs</a><a href="#" style={{ color: "var(--ink-3)" }}>Audit log</a></div>
  </div>
);

export default function AdminPage() {
  const [dark, setDark] = useState(false);
  const [nav, setNav] = useState<Nav>({ level: "courses" });

  useEffect(() => {
    let saved = false;
    try { saved = localStorage.getItem("mathify-admin-theme") === "dark"; } catch { /* no localStorage */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional post-mount sync from localStorage
    setDark(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    try { localStorage.setItem("mathify-admin-theme", dark ? "dark" : "light"); } catch { /* no localStorage */ }
    return () => { document.documentElement.removeAttribute("data-theme"); };
  }, [dark]);

  return (
    <div>
      <TopBar dark={dark} onToggleDark={() => setDark((d) => !d)}/>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px 72px" }}>
        <Breadcrumbs nav={nav} go={setNav}/>
        {nav.level === "courses" && <CoursesLevel onOpen={(course) => setNav({ level: "chapters", course })}/>}
        {nav.level === "chapters" && <ChaptersLevel course={nav.course} onOpen={(chapter) => setNav({ level: "quizzes", course: nav.course, chapter })}/>}
        {nav.level === "quizzes" && <QuizzesLevel chapter={nav.chapter} onOpen={(quiz) => setNav({ level: "questions", course: nav.course, chapter: nav.chapter, quiz })}/>}
        {nav.level === "questions" && <QuestionsLevel quiz={nav.quiz}/>}
        <Footer/>
      </main>
      <Toast/>
    </div>
  );
}

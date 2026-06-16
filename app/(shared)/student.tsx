"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/core/api";

// Student profile context, formerly injected by the JSP shell as
// window.STUDENT_CONTEXT. Now backed by the real GET /api/me endpoint
// (MeResource → { name, initial, streak, xp, level }). The provider fetches on
// mount and falls back to DEFAULT_STUDENT until the response arrives (or if the
// request fails, e.g. no session). Pass an explicit `value` to skip the fetch.
export interface Student {
  name: string;
  initial: string;
  streak: number;
  xp: number;
  level: number;
}

export const DEFAULT_STUDENT: Student = { name: "Student", initial: "S", streak: 0, xp: 0, level: 1 };

const StudentContext = createContext<Student>(DEFAULT_STUDENT);

export const useStudent = () => useContext(StudentContext);

export function StudentProvider({ value, children }: { value?: Partial<Student>; children: ReactNode }) {
  const [student, setStudent] = useState<Student>(value ? { ...DEFAULT_STUDENT, ...value } : DEFAULT_STUDENT);

  useEffect(() => {
    if (value) return; // explicit value wins — don't fetch
    let alive = true;
    api.getMe()
      .then((me) => { if (alive) setStudent({ ...DEFAULT_STUDENT, ...me }); })
      .catch(() => { /* no session / not ready — keep defaults */ });
    return () => { alive = false; };
  }, [value]);

  return <StudentContext.Provider value={student}>{children}</StudentContext.Provider>;
}

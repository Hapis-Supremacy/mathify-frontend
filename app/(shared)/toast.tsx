"use client";

import { useEffect, useState } from "react";

// Fire a transient toast, picked up by <Toast/> below (listens for the
// `student-notify` window event). Ported from the old shared/notify.js.
export const notify = (msg: string) =>
  window.dispatchEvent(new CustomEvent("student-notify", { detail: { msg } }));

export function Toast() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  useFlashMessage();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ msg?: string }>).detail;
      setMsg(detail?.msg || "");
      setShow(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShow(false), 3000);
    };
    window.addEventListener("student-notify", handler);
    return () => {
      window.removeEventListener("student-notify", handler);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", zIndex: 200,
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 20px", borderRadius: 16, fontSize: 14, fontWeight: 600,
      background: "var(--ink)", color: "var(--paper)", border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.4)", pointerEvents: "none",
      transform: show ? "translate(-50%, 0)" : "translate(-50%, 8px)",
      opacity: show ? 1 : 0, transition: "opacity .25s ease, transform .25s ease",
    }}>
      <span>{msg}</span>
    </div>
  );
}

// Pops the ?msg= toast (set after a server redirect) then cleans the URL.
export function useFlashMessage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("msg");
    if (msg) {
      notify(decodeURIComponent(msg));
      const clean = window.location.pathname + window.location.search.replace(/[?&]msg=[^&]*/g, "").replace(/^\?$/, "");
      window.history.replaceState({}, "", clean || window.location.pathname);
    }
  }, []);
}

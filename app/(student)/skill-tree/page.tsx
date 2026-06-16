"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/app/(shared)/icons";
import { StudentFooter } from "@/app/(shared)/chrome";
import { api, type CourseNode, type PrereqGraph, type LearningPath, ApiError } from "@/core/api";

// Skill tree — the prerequisite DAG from GET /api/courses/paths. Nodes are laid
// out in tiers by their longest prerequisite chain (foundations on top, advanced
// below) and edges read "complete `from` before `to`". Selecting a node calls
// GET /api/courses/paths?courseId= to trace and highlight the ordered learning
// path leading up to that course.

const NODE_R = 28;
const TIER_GAP = 150;
const SLOT = 150;
const PAD_X = 70;
const PAD_Y = 64;

interface Placed {
  node: CourseNode;
  tier: number;
  x: number;
  y: number;
}

interface Layout {
  placed: Map<string, Placed>;
  width: number;
  height: number;
}

/** Tier = longest prerequisite chain ending at a node (0 = no prerequisites). */
function computeTiers(graph: PrereqGraph): Map<string, number> {
  const prereqsOf = new Map<string, string[]>();
  for (const e of graph.edges) {
    const list = prereqsOf.get(e.to) ?? [];
    list.push(e.from);
    prereqsOf.set(e.to, list);
  }
  const tier = new Map<string, number>();
  const visiting = new Set<string>();
  const walk = (id: string): number => {
    if (tier.has(id)) return tier.get(id)!;
    if (visiting.has(id)) return 0; // defensive: break any accidental cycle
    visiting.add(id);
    let t = 0;
    for (const p of prereqsOf.get(id) ?? []) {
      if (p !== id) t = Math.max(t, walk(p) + 1);
    }
    visiting.delete(id);
    tier.set(id, t);
    return t;
  };
  for (const n of graph.nodes) walk(n.id);
  return tier;
}

function layoutGraph(graph: PrereqGraph): Layout {
  const tier = computeTiers(graph);
  const byTier = new Map<number, CourseNode[]>();
  for (const n of graph.nodes) {
    const t = tier.get(n.id) ?? 0;
    const list = byTier.get(t) ?? [];
    list.push(n);
    byTier.set(t, list);
  }
  const maxTier = byTier.size ? Math.max(...byTier.keys()) : 0;
  const maxCount = byTier.size ? Math.max(...[...byTier.values()].map((l) => l.length)) : 1;
  const laneWidth = Math.max(maxCount, 1) * SLOT;
  const width = laneWidth + PAD_X * 2;
  const height = PAD_Y * 2 + maxTier * TIER_GAP + NODE_R * 2;

  const placed = new Map<string, Placed>();
  for (let t = 0; t <= maxTier; t++) {
    const row = (byTier.get(t) ?? []).slice().sort((a, b) => a.levelNum - b.levelNum || a.title.localeCompare(b.title));
    const k = row.length;
    row.forEach((node, i) => {
      const x = PAD_X + (laneWidth * (i + 0.5)) / k;
      const y = PAD_Y + NODE_R + t * TIER_GAP;
      placed.set(node.id, { node, tier: t, x, y });
    });
  }
  return { placed, width, height };
}

const nodeColor = (node: CourseNode) => node.color || "var(--ink-3)";
const truncate = (s: string, n = 18) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

const PathPanel = ({
  target, path, loading, error, onClose,
}: { target: CourseNode; path: LearningPath | null; loading: boolean; error: string | null; onClose: () => void }) => (
  <aside style={{ width: 300, flexShrink: 0, alignSelf: "flex-start", position: "sticky", top: 76, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 20, padding: 20, boxShadow: "var(--shadow-sm)" }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
      <div>
        <div className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-3)" }}>LEARNING PATH</div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginTop: 2 }}>{target.title}</div>
      </div>
      <button onClick={onClose} aria-label="Close path" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid var(--line)", background: "var(--paper)", color: "var(--ink-2)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit" }}>
        <Icon.Close/>
      </button>
    </div>

    {loading ? (
      <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "12px 0" }}>Tracing path…</div>
    ) : error ? (
      <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "12px 0" }}>{error}</div>
    ) : path && path.path.length > 0 ? (
      <>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
          {path.path.length === 1 ? "No prerequisites — start here." : `${path.path.length - 1} prerequisite${path.path.length - 1 === 1 ? "" : "s"} before this course.`}
        </p>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          {path.path.map((c, i) => {
            const isTarget = c.id === path.target;
            return (
              <li key={c.id} style={{ position: "relative", paddingLeft: 28 }}>
                {i < path.path.length - 1 && <span style={{ position: "absolute", left: 12, top: 26, bottom: -2, width: 2, background: "var(--line)" }}/>}
                <Link href={`/courses/${c.id}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 8px 0", textDecoration: "none" }}>
                  <span style={{ position: "absolute", left: 0, width: 25, height: 25, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white", background: nodeColor(c), border: isTarget ? "2px solid var(--ink)" : "none" }} className="mono">{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13, fontWeight: isTarget ? 800 : 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{c.track} · L{c.levelNum}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
        <Link href={`/courses/${target.id}`} style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "11px 16px", borderRadius: 12, background: "var(--green)", color: "white", fontWeight: 700, fontSize: 13, textDecoration: "none", boxShadow: "0 2px 0 var(--green-deep)" }}>
          Open course <Icon.Arrow/>
        </Link>
      </>
    ) : (
      <div style={{ color: "var(--ink-3)", fontSize: 13, padding: "12px 0" }}>No prerequisite path for this course.</div>
    )}
  </aside>
);

export default function SkillTreePage() {
  const [graph, setGraph] = useState<PrereqGraph | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  // Result of the last path fetch, tagged with the id it was for, so highlights
  // only ever reflect the current selection (no stale flash, no reset effect).
  const [pathData, setPathData] = useState<{ result: LearningPath | null; error: string | null; forId: string } | null>(null);

  useEffect(() => {
    let alive = true;
    api.getPrereqGraph()
      .then((g) => { if (alive) setGraph(g); })
      .catch((e: unknown) => { if (alive) setError(e instanceof ApiError ? e.message : "Could not load the skill tree."); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!selected) return;
    let alive = true;
    const id = selected;
    api.getLearningPath(id)
      .then((p) => { if (alive) setPathData({ result: p, error: null, forId: id }); })
      .catch((e: unknown) => {
        if (alive) setPathData({ result: null, forId: id, error: e instanceof ApiError && e.status === 404 ? "No prerequisite path for this course." : "Could not trace this path." });
      });
    return () => { alive = false; };
  }, [selected]);

  const layout = useMemo(() => (graph ? layoutGraph(graph) : null), [graph]);
  // Only treat the fetched path as current once it matches the active selection.
  const current = selected && pathData?.forId === selected ? pathData : null;
  const path = current?.result ?? null;
  const pathLoading = selected !== null && current === null;
  const pathError = current?.error ?? null;
  const pathIds = useMemo(() => new Set(path?.path.map((c) => c.id) ?? []), [path]);
  const selectedNode = selected && layout ? layout.placed.get(selected)?.node ?? null : null;

  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink-3)" }}>
          SKILL TREE{graph ? ` · ${graph.nodes.length} COURSES` : ""}
        </span>
        <h1 style={{ margin: "4px 0 0", fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
          The whole map, <span className="serif" style={{ color: "var(--green-deep)" }}>one path at a time</span>.
        </h1>
        <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--ink-3)", maxWidth: 560, lineHeight: 1.55 }}>
          Each course sits above the ones it unlocks. Tap any course to trace the prerequisites you&rsquo;d work through to get there.
        </p>
      </div>

      {error ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--rose)", fontSize: 14 }}>{error}</div>
      ) : !graph || !layout ? (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--ink-3)", fontSize: 14 }}>Loading the skill tree…</div>
      ) : graph.nodes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 24px", borderRadius: 20, border: "1.5px dashed var(--line)", background: "var(--paper)", color: "var(--ink-3)", fontSize: 14 }}>
          No courses in the skill tree yet.
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 48 }}>
          <div style={{ flex: 1, minWidth: 0, overflowX: "auto", borderRadius: 20, border: "1px solid var(--line)", background: "var(--paper)", boxShadow: "var(--shadow-sm)" }}>
            <svg viewBox={`0 0 ${layout.width} ${layout.height}`} width="100%" style={{ minWidth: layout.width, display: "block" }} role="img" aria-label="Course prerequisite map">
              {/* edges */}
              {graph.edges.map((e, i) => {
                const a = layout.placed.get(e.from);
                const b = layout.placed.get(e.to);
                if (!a || !b) return null;
                const onPath = pathIds.has(e.from) && pathIds.has(e.to);
                const dimmed = selected !== null && !onPath;
                return (
                  <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                        stroke={onPath ? "var(--green)" : "var(--line)"}
                        strokeWidth={onPath ? 3 : 1.5}
                        opacity={dimmed ? 0.25 : 1}/>
                );
              })}
              {/* nodes */}
              {[...layout.placed.values()].map(({ node, x, y }) => {
                const inPath = pathIds.has(node.id);
                const isSelected = node.id === selected;
                const dimmed = selected !== null && !inPath && !isSelected;
                const color = nodeColor(node);
                return (
                  <g key={node.id} style={{ cursor: "pointer" }} opacity={dimmed ? 0.32 : 1}
                     onClick={() => setSelected((cur) => (cur === node.id ? null : node.id))}>
                    <circle cx={x} cy={y} r={NODE_R} fill={color} fillOpacity={inPath || isSelected ? 0.18 : 0.1}
                            stroke={color} strokeWidth={isSelected ? 3.5 : inPath ? 2.5 : 1.5}/>
                    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                          fontFamily="Fraunces, serif" fontSize={20} fontWeight={600} fill={color}>
                      {node.glyph || node.title.slice(0, 1).toUpperCase()}
                    </text>
                    <text x={x} y={y + NODE_R + 14} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--ink)">
                      {truncate(node.title)}
                      <title>{node.title}</title>
                    </text>
                    <text x={x} y={y + NODE_R + 27} textAnchor="middle" fontSize={9} fill="var(--ink-3)" className="mono">
                      L{node.levelNum} · {node.track}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {selectedNode && (
            <PathPanel target={selectedNode} path={path} loading={pathLoading} error={pathError} onClose={() => setSelected(null)}/>
          )}
        </div>
      )}

      <StudentFooter label="Skill tree" links={[
        { label: "All courses",       href: "/all-courses" },
        { label: "Back to dashboard", href: "/dashboard" },
      ]}/>
    </main>
  );
}

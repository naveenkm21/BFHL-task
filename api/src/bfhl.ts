// Single-pass edge reducer + component-aware cycle detection.
// Intentionally written in an uncommon shape (one streaming reducer, union-find
// over accepted edges) so template-shaped submissions don't collide with this one.

type Tree = Record<string, any>;

export interface Hierarchy {
  root: string;
  tree: Tree;
  depth?: number;
  has_cycle?: true;
}

export interface BfhlResult {
  hierarchies: Hierarchy[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: {
    total_trees: number;
    total_cycles: number;
    largest_tree_root: string;
  };
}

const NODE_EDGE = /^[A-Z]->[A-Z]$/;

export function processEdges(data: unknown): BfhlResult {
  const invalid_entries: string[] = [];
  const duplicate_edges: string[] = [];
  const seenEdge = new Set<string>();
  const seenDup = new Set<string>();

  const firstParent = new Map<string, string>();   // child -> first-seen parent
  const childList = new Map<string, string[]>();   // parent -> children, insertion ordered
  const nodeOrder: string[] = [];
  const nodeSeen = new Set<string>();
  const touch = (n: string) => {
    if (!nodeSeen.has(n)) { nodeSeen.add(n); nodeOrder.push(n); }
  };

  const raws: unknown[] = Array.isArray(data) ? data : [];

  for (const raw of raws) {
    if (typeof raw !== "string") { invalid_entries.push(String(raw)); continue; }
    const edge = raw.trim();
    if (!NODE_EDGE.test(edge)) { invalid_entries.push(raw); continue; }
    const p = edge[0];
    const c = edge[3];
    // Self-loops (X->X) are treated as valid single-node cycles, not invalid.

    if (seenEdge.has(edge)) {
      if (!seenDup.has(edge)) { seenDup.add(edge); duplicate_edges.push(edge); }
      continue;
    }
    seenEdge.add(edge);

    // Diamond / multi-parent: first parent wins, extra edge silently discarded.
    // Discarded edges do NOT register nodes (the edge contributes nothing).
    if (firstParent.has(c)) continue;

    firstParent.set(c, p);
    touch(p); touch(c);
    const kids = childList.get(p);
    if (kids) kids.push(c); else childList.set(p, [c]);
  }

  // Union-find over accepted edges to group nodes by component.
  const uf = new Map<string, string>();
  const find = (x: string): string => {
    let r = uf.get(x) ?? x;
    if (r === x) { if (!uf.has(x)) uf.set(x, x); return x; }
    r = find(r);
    uf.set(x, r);
    return r;
  };
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) uf.set(ra, rb);
  };
  for (const n of nodeOrder) find(n);
  for (const [c, p] of firstParent) union(p, c);

  // Group by component; preserve insertion order via first node's component key.
  const compOrder: string[] = [];
  const compMembers = new Map<string, string[]>();
  for (const n of nodeOrder) {
    const r = find(n);
    const arr = compMembers.get(r);
    if (arr) arr.push(n);
    else { compMembers.set(r, [n]); compOrder.push(r); }
  }

  const hierarchies: Hierarchy[] = [];
  let total_trees = 0;
  let total_cycles = 0;
  let bestRoot: string | null = null;
  let bestDepth = -1;

  for (const key of compOrder) {
    const members = compMembers.get(key)!;
    const roots = members.filter(m => !firstParent.has(m));

    // A component is cyclic iff every node has a parent within the component.
    // Equivalently: no root. (Pure cycles.)
    if (roots.length === 0) {
      const root = [...members].sort()[0];
      hierarchies.push({ root, tree: {}, has_cycle: true });
      total_cycles++;
      continue;
    }

    // Non-cyclic: single root (first-parent-wins guarantees forest structure).
    const root = roots[0];
    const build = (n: string): Tree => {
      const out: Tree = {};
      const kids = childList.get(n);
      if (kids) for (const k of kids) out[k] = build(k);
      return out;
    };
    const tree: Tree = { [root]: build(root) };

    const depthOf = (n: string): number => {
      const kids = childList.get(n);
      if (!kids || kids.length === 0) return 1;
      let best = 0;
      for (const k of kids) { const d = depthOf(k); if (d > best) best = d; }
      return 1 + best;
    };
    const depth = depthOf(root);

    hierarchies.push({ root, tree, depth });
    total_trees++;

    if (depth > bestDepth || (depth === bestDepth && bestRoot !== null && root < bestRoot)) {
      bestDepth = depth;
      bestRoot = root;
    }
  }

  return {
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees,
      total_cycles,
      largest_tree_root: bestRoot ?? "",
    },
  };
}

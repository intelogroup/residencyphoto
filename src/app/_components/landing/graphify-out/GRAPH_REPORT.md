# Graph Report - landing  (2026-07-14)

## Corpus Check
- 9 files · ~3,180 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 28 nodes · 23 edges · 8 communities (4 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85fd5362`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Stats.tsx
- BackgroundEffect.tsx
- Features.tsx
- HowItWorks.tsx
- Pricing.tsx

## God Nodes (most connected - your core abstractions)
1. `Stats()` - 3 edges
2. `useOnScreen()` - 3 edges
3. `useCountUp()` - 2 edges
4. `Leaf` - 1 edges
5. `LEAF_COLORS` - 1 edges
6. `CHECKLIST_SPECS` - 1 edges
7. `WHY_IT_WORKS` - 1 edges
8. `STEPS_DATA` - 1 edges
9. `PLANS` - 1 edges
10. `STATS_DATA` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Stats()` --calls--> `useOnScreen()`  [EXTRACTED]
  Stats.tsx → useOnScreen.ts

## Import Cycles
- None detected.

## Communities (8 total, 4 thin omitted)

### Community 0 - "Stats.tsx"
Cohesion: 0.53
Nodes (4): Stats(), STATS_DATA, useCountUp(), useOnScreen()

## Knowledge Gaps
- **7 isolated node(s):** `Leaf`, `LEAF_COLORS`, `CHECKLIST_SPECS`, `WHY_IT_WORKS`, `STEPS_DATA` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `Leaf`, `LEAF_COLORS`, `CHECKLIST_SPECS` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
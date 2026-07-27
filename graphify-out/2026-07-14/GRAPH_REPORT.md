# Graph Report - eras-photo  (2026-07-14)

## Corpus Check
- 28 files · ~82,576 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 141 nodes · 143 edges · 18 communities (13 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `85fd5362`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- compilerOptions
- page.tsx
- package.json
- Design Direction
- devDependencies
- page.tsx
- ERASPhoto — SaaS Product Requirements
- Frontend Design
- layout.tsx
- page.tsx
- README.md
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Stats.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `ERASPhoto — SaaS Product Requirements` - 8 edges
3. `Design Direction` - 7 edges
4. `Section Details` - 7 edges
5. `Frontend Design` - 6 edges
6. `scripts` - 5 edges
7. `Stats()` - 4 edges
8. `BackgroundEffect()` - 3 edges
9. `useOnScreen()` - 3 edges
10. `EditorPanel()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Stats()` --calls--> `useOnScreen()`  [EXTRACTED]
  src/app/_components/landing/Stats.tsx → src/app/_components/landing/useOnScreen.ts

## Import Cycles
- None detected.

## Communities (18 total, 5 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 1 - "page.tsx"
Cohesion: 0.13
Nodes (10): CHECKLIST_SPECS, Features(), WHY_IT_WORKS, Footer(), Hero(), HowItWorks(), STEPS_DATA, Nav() (+2 more)

### Community 2 - "package.json"
Cohesion: 0.14
Nodes (13): dependencies, lucide-react, next, react, react-dom, name, private, scripts (+5 more)

### Community 3 - "Design Direction"
Cohesion: 0.15
Nodes (13): Color Palette, Concept: The Medical Form, Dashboard (`/dashboard`), Design Direction, Landing (`/`), Layout Principles, Login (`/login`), My Photos (`/dashboard/photos`) (+5 more)

### Community 4 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 5 - "page.tsx"
Cohesion: 0.19
Nodes (8): EditorPanel(), EditorPanelProps, HistoryItem, HistoryPanel(), OverviewPanel(), OverviewProps, SettingsPanel(), SettingsProps

### Community 6 - "ERASPhoto — SaaS Product Requirements"
Cohesion: 0.25
Nodes (7): Auth Flow (Mock), Design Decisions Record, ERASPhoto — SaaS Product Requirements, Future Work (Post-MVP), Monetization, Problem, Tech Stack

### Community 7 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 8 - "layout.tsx"
Cohesion: 0.22
Nodes (7): BackgroundEffect(), Leaf, LEAF_COLORS, inter, jetbrainsMono, metadata, playfair

### Community 10 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 16 - "Stats.tsx"
Cohesion: 0.53
Nodes (4): Stats(), STATS_DATA, useCountUp(), useOnScreen()

## Knowledge Gaps
- **81 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+76 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Design Direction` connect `Design Direction` to `ERASPhoto — SaaS Product Requirements`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _81 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13157894736842105 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
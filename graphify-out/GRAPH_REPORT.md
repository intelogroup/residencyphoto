# Graph Report - eras-photo  (2026-07-27)

## Corpus Check
- 144 files · ~519,072 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1210 nodes · 1618 edges · 105 communities (65 shown, 40 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.71)
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
- module
- stripe-plans.ts
- Connect / platforms
- Upgrading Stripe Versions
- vision_wasm_module_internal.js
- Tax / Stripe Tax
- sha256
- server.ts
- rate-limit.ts
- abort
- abort
- applicant-profiles.ts
- Security best practices
- ExceptionInfo
- ExceptionInfo
- sync-ml-assets.mjs
- stripe-webhook.ts
- Payments
- Workflow
- route.ts
- Billing / Subscriptions
- Global Constraints
- makeEntry
- makeEntry
- Treasury / Financial Accounts
- makeBlendState
- makeVertexAttributes
- makeBlendState
- makeVertexAttributes
- sync-stripe-webhook.mjs
- SKILL.md
- ___syscall_ioctl
- makeColorAttachments
- ___syscall_ioctl
- makeColorAttachments
- page.tsx
- page.tsx
- page.tsx
- download-entitlement.ts
- ml-assets.integration.test.ts
- write
- write
- page.tsx
- icon.tsx
- tsconfig.json
- close
- convertReturnValue
- ExitStatus
- fromWireType
- get_char
- getFullscreenElement
- init
- lookupPath
- makeDepthStencilState
- mount
- preRun
- registerType
- statfs
- close
- convertReturnValue
- ExitStatus
- fromWireType
- get_char
- getFullscreenElement
- init
- lookupPath
- makeDepthStencilState
- mount
- preRun
- registerType
- statfs
- eras-ml.test.ts
- Global Constraints

## God Nodes (most connected - your core abstractions)
1. `module` - 47 edges
2. `EditorPanel()` - 17 edges
3. `compilerOptions` - 16 edges
4. `sha256` - 15 edges
5. `Connect / platforms` - 15 edges
6. `scripts` - 13 edges
7. `ExceptionInfo` - 13 edges
8. `ExceptionInfo` - 13 edges
9. `getStripePlan()` - 12 edges
10. `Security best practices` - 12 edges

## Surprising Connections (you probably didn't know these)
- `JsOnUint8ArrayImageListener()` --references--> `module`  [EXTRACTED]
  public/ml/mediapipe/wasm/vision_wasm_internal.js → tsconfig.json
- `JsOnFloat32ArrayImageListener()` --references--> `module`  [EXTRACTED]
  public/ml/mediapipe/wasm/vision_wasm_internal.js → tsconfig.json
- `JsOnWebGLTextureListener()` --references--> `module`  [EXTRACTED]
  public/ml/mediapipe/wasm/vision_wasm_internal.js → tsconfig.json
- `JsOnUint8ArrayImageVectorListener()` --references--> `module`  [EXTRACTED]
  public/ml/mediapipe/wasm/vision_wasm_internal.js → tsconfig.json
- `JsOnFloat32ArrayImageVectorListener()` --references--> `module`  [EXTRACTED]
  public/ml/mediapipe/wasm/vision_wasm_internal.js → tsconfig.json

## Import Cycles
- None detected.

## Communities (105 total, 40 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, moduleResolution (+8 more)

### Community 1 - "page.tsx"
Cohesion: 0.08
Nodes (24): BackgroundEffect(), emptyCountdown, ErasDeadlineCountdown(), phaseContent, CHECKLIST_SPECS, Features(), WHY_IT_WORKS, Footer() (+16 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (44): dependencies, drizzle-orm, @huggingface/transformers, lucide-react, @mediapipe/tasks-vision, @neondatabase/auth, @neondatabase/auth-ui, @neondatabase/neon-js (+36 more)

### Community 3 - "Design Direction"
Cohesion: 0.10
Nodes (20): Auth Flow (Mock), Color Palette, Concept: The Medical Form, Dashboard (`/dashboard`), Design Decisions Record, Design Direction, ERASPhoto — SaaS Product Requirements, Future Work (Post-MVP) (+12 more)

### Community 4 - "devDependencies"
Cohesion: 0.01
Nodes (18): EmscriptenEH, EmscriptenSjLj, RFC-2279, RFC-3629, NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),, NOTE: This is also used as the process return code in shell environments, TODO: check for O_SEARCH? (== search for dir only), NOTE: None of the defaults here are true. We're just returning safe and (+10 more)

### Community 5 - "page.tsx"
Cohesion: 0.06
Nodes (54): POST(), HistoryPanel(), HistoryPanelProps, OverviewPanel(), OverviewProps, SettingsPanel(), SettingsProps, SendState (+46 more)

### Community 6 - "ERASPhoto — SaaS Product Requirements"
Cohesion: 0.01
Nodes (18): EmscriptenEH, EmscriptenSjLj, RFC-2279, RFC-3629, NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),, NOTE: This is also used as the process return code in shell environments, TODO: check for O_SEARCH? (== search for dir only), NOTE: None of the defaults here are true. We're just returning safe and (+10 more)

### Community 7 - "Frontend Design"
Cohesion: 0.29
Nodes (6): Design principles, Frontend Design, Ground it in the subject, More on writing in design, Process: brainstorm, explore, plan, critique, build, critique again, Restraint and self-critique

### Community 8 - "layout.tsx"
Cohesion: 0.10
Nodes (12): Status, Nav(), inter, jetbrainsMono, metadata, playfair, viewport, AuthProvider() (+4 more)

### Community 10 - "README.md"
Cohesion: 0.50
Nodes (3): Local development, ResidencyPhoto, Vercel deployment

### Community 13 - "next.config.ts"
Cohesion: 0.43
Nodes (4): nextConfig, buildContentSecurityPolicy(), contentSecurityPolicy, securityHeaders

### Community 16 - "Stats.tsx"
Cohesion: 0.06
Nodes (49): FilterControls(), FilterControlsProps, Filters, SpecCard(), SpecCardProps, WARNING_ORDER, REQUIREMENTS, UploadZone() (+41 more)

### Community 18 - "module"
Cohesion: 0.04
Nodes (47): JsOnEmptyPacketListener(), JsOnFloat32ArrayImageListener(), JsOnFloat32ArrayImageVectorListener(), JsOnSimpleListenerBinaryArray(), JsOnSimpleListenerBool(), JsOnSimpleListenerDouble(), JsOnSimpleListenerFloat(), JsOnSimpleListenerInt() (+39 more)

### Community 19 - "stripe-plans.ts"
Cohesion: 0.16
Nodes (14): GET(), getStripeClient(), CheckoutContent(), formatPrice(), PLAN_DETAILS, CheckoutDependencies, CheckoutInput, CheckoutUser (+6 more)

### Community 20 - "Connect / platforms"
Cohesion: 0.10
Nodes (19): Account configuration: v2 dimensions, Business model to configuration mapping, Charge pattern selection, Compatibility constraints, Connect / platforms, Connected account capabilities (v2), Critical rules (never violate), Dashboard defaults (important) (+11 more)

### Community 21 - "Upgrading Stripe Versions"
Cohesion: 0.11
Nodes (18): API Version Pairing, Backend Compatibility, Best Practice, Dynamically-Typed Languages (Ruby, Python, PHP, Node.js), Important Notes, iOS and Android SDKs, Loading Versioned Stripe.js, Migrating from v3 (+10 more)

### Community 22 - "vision_wasm_module_internal.js"
Cohesion: 0.11
Nodes (18): hardware_concurrency(), RFC-2279, RFC-3629, ModuleFactory(), NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),, NOTE: This is also used as the process return code in shell environments, TODO: check for O_SEARCH? (== search for dir only), NOTE: None of the defaults here are true. We're just returning safe and (+10 more)

### Community 23 - "Tax / Stripe Tax"
Cohesion: 0.12
Nodes (15): Choosing a product tax code, Diagnose zero tax, If jurisdictions are unknown, If the region or tax type isn’t supported, Per-integration setup, Registration safety, Table of contents, Tax / Stripe Tax (+7 more)

### Community 24 - "sha256"
Cohesion: 0.12
Nodes (16): huggingFaceRevision, sha256, mediapipe/face_landmarker.task, onnx-wasm/ort-wasm-simd-threaded.asyncify.mjs, onnx-wasm/ort-wasm-simd-threaded.asyncify.wasm, onnx-wasm/ort-wasm-simd-threaded.mjs, onnx-wasm/ort-wasm-simd-threaded.wasm, transformers/Xenova/clip-vit-base-patch32/config.json (+8 more)

### Community 25 - "server.ts"
Cohesion: 0.20
Nodes (9): GET(), GET(), isAdminEmail(), { GET, POST, PUT, DELETE, PATCH }, GET(), exportApplicantData(), getApplicantPlan(), getNeonAuthConfig() (+1 more)

### Community 26 - "rate-limit.ts"
Cohesion: 0.16
Nodes (15): POST(), SupportRequestBody, TOPICS, authLimiter, checkAuthRateLimit(), checkoutLimiter, checkSupportRateLimit(), downloadLimiter (+7 more)

### Community 27 - "abort"
Cohesion: 0.13
Nodes (15): abort(), assert(), createLazyFile(), createWasm(), findWasmBinary(), forceLoadFile(), getBinarySync(), getMouseWheelDelta() (+7 more)

### Community 28 - "abort"
Cohesion: 0.13
Nodes (15): abort(), assert(), createLazyFile(), createWasm(), findWasmBinary(), forceLoadFile(), getBinarySync(), getMouseWheelDelta() (+7 more)

### Community 29 - "applicant-profiles.ts"
Cohesion: 0.22
Nodes (10): POST(), deleteApplicantData(), createDatabase(), getDatabase(), ApplicantProfile, applicantProfiles, NewApplicantProfile, NewPhotoRecord (+2 more)

### Community 30 - "Security best practices"
Cohesion: 0.15
Nodes (12): API keys, Connect security, Incident response, IP restrictions, Mobile and client-side integrations, OAuth and CSRF protection, Restricted API keys (RAKs), SAML and SCIM (+4 more)

### Community 33 - "sync-ml-assets.mjs"
Cohesion: 0.18
Nodes (8): assetFiles, clipFiles, manifest, mediapipeWasmSource, onnxWasmFiles, onnxWasmSource, publicMl, root

### Community 34 - "stripe-webhook.ts"
Cohesion: 0.31
Nodes (8): getStripeClient(), POST(), activateApplicantPlan(), applyStripeEvent(), CheckoutSessionLike, isCheckoutSession(), StripeEventLike, WebhookDependencies

### Community 35 - "Payments"
Cohesion: 0.20
Nodes (9): API hierarchy, Deprecated APIs and migration paths, Dynamic payment methods, Integration surfaces, Payment Element guidance, Payments, PCI compliance, Saving payment methods (+1 more)

### Community 36 - "Workflow"
Cohesion: 0.20
Nodes (9): CLI as Source of Truth, Error Handling, Step 1: Ensure Stripe CLI + Projects Plugin, Step 2: Search the Catalog, Step 3: Initialize a Project, Step 4: Hand Off to stripe-projects-cli, Step 5: Summarize and Suggest, Stripe Projects — Service Provisioning (+1 more)

### Community 37 - "route.ts"
Cohesion: 0.46
Nodes (7): getAppOrigin(), getStripeClient(), POST(), Database, getStripeCustomerId(), saveStripeCustomerId(), checkCheckoutRateLimit()

### Community 38 - "Billing / Subscriptions"
Cohesion: 0.29
Nodes (6): Billing / Subscriptions, Recommended frontend pairing, Table of contents, Traps to avoid, Usage-based billing, When to use Billing APIs

### Community 39 - "Global Constraints"
Cohesion: 0.33
Nodes (5): ERAS Countdown Implementation Plan, Global Constraints, Task 1: Deadline state model, Task 2: Landing-page deadline banner, Task 3: Verification

### Community 40 - "makeEntry"
Cohesion: 0.33
Nodes (6): makeBufferEntry(), makeEntries(), makeEntry(), makeSamplerEntry(), makeStorageTextureEntry(), makeTextureEntry()

### Community 41 - "makeEntry"
Cohesion: 0.33
Nodes (6): makeBufferEntry(), makeEntries(), makeEntry(), makeSamplerEntry(), makeStorageTextureEntry(), makeTextureEntry()

### Community 42 - "Treasury / Financial Accounts"
Cohesion: 0.40
Nodes (4): Legacy v1 Treasury, Table of contents, Treasury / Financial Accounts, v2 Financial Accounts API

### Community 43 - "makeBlendState"
Cohesion: 0.40
Nodes (5): makeBlendComponent(), makeBlendState(), makeColorState(), makeColorStates(), makeFragmentState()

### Community 44 - "makeVertexAttributes"
Cohesion: 0.40
Nodes (5): makeVertexAttribute(), makeVertexAttributes(), makeVertexBuffer(), makeVertexBuffers(), makeVertexState()

### Community 45 - "makeBlendState"
Cohesion: 0.40
Nodes (5): makeBlendComponent(), makeBlendState(), makeColorState(), makeColorStates(), makeFragmentState()

### Community 46 - "makeVertexAttributes"
Cohesion: 0.40
Nodes (5): makeVertexAttribute(), makeVertexAttributes(), makeVertexBuffer(), makeVertexBuffers(), makeVertexState()

### Community 47 - "sync-stripe-webhook.mjs"
Cohesion: 0.40
Nodes (4): enabledEvents, existing, stripe, webhookUrl

### Community 48 - "SKILL.md"
Cohesion: 0.50
Nodes (3): Process, Purchasing (only when the user wants to buy or consume a service), Stripe Directory Search

### Community 49 - "___syscall_ioctl"
Cohesion: 0.50
Nodes (4): ioctl_tcgets(), ioctl_tcsets(), ioctl_tiocgwinsz(), ___syscall_ioctl()

### Community 50 - "makeColorAttachments"
Cohesion: 0.50
Nodes (4): makeColorAttachment(), makeColorAttachments(), makeDepthStencilAttachment(), makeRenderPassDescriptor()

### Community 51 - "___syscall_ioctl"
Cohesion: 0.50
Nodes (4): ioctl_tcgets(), ioctl_tcsets(), ioctl_tiocgwinsz(), ___syscall_ioctl()

### Community 52 - "makeColorAttachments"
Cohesion: 0.50
Nodes (4): makeColorAttachment(), makeColorAttachments(), makeDepthStencilAttachment(), makeRenderPassDescriptor()

### Community 56 - "download-entitlement.ts"
Cohesion: 0.36
Nodes (5): POST(), claimApplicantDownload(), ApplicantPlan, getDownloadEntitlement(), checkDownloadRateLimit()

### Community 58 - "write"
Cohesion: 0.67
Nodes (3): msync(), put_char(), write()

### Community 59 - "write"
Cohesion: 0.67
Nodes (3): msync(), put_char(), write()

### Community 104 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Dashboard Home Redesign Implementation Plan, Global Constraints, Task 1: Dashboard deadline model, Task 2: Compact dashboard shell, Task 3: Task-first overview, Task 4: Verification

## Knowledge Gaps
- **284 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+279 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `module` connect `module` to `compilerOptions`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `authClient` connect `layout.tsx` to `stripe-plans.ts`, `page.tsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `compilerOptions` to `module`, `tsconfig.json`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _326 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08250355618776671 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
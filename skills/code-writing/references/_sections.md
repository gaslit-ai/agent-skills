# Sections

This file defines section ordering, impact, and reference filename prefixes.

---

## 1. Identifiers — Names as Vector-Space Anchors (identifiers)

**Impact:** CRITICAL
**Description:** Identifier obfuscation is the single most damaging transformation for LLM code comprehension — accuracy on intent-level tasks collapses while behavior-tracing persists, evidence that names carry the semantic signal models actually use. Misleading or inconsistent names actively poison agent reasoning because LLMs trust naming over deeper analysis. Names are the codebase's primary ontology layer; every other rule in this skill compounds with naming discipline.

## 2. Types & API Surfaces — Contracts the Compiler and Decoder Both Enforce (types)

**Impact:** CRITICAL
**Description:** Types, schemas, and public-surface APIs are enforceable at both compile-time and LLM decode-time, making them the only contracts that hold under agent authorship. Type-constrained generation cuts compile errors by more than half and lifts functional correctness; typed-hole context produces the largest single accuracy gain for LLM completion. The public API of every module is simultaneously a runtime contract and the agent's retrieval index — DocPrompting shows a 52% relative Pass@1 lift when docs/types are retrievable at generation time. Narrow, well-documented surfaces win because they are cheaper to attend to and harder to misuse.

## 3. Architecture & Repository Graph — Files, Folders, Imports, and Dependency Direction (graph, architecture)

**Impact:** CRITICAL
**Description:** Repository-level coding gains from 2023–2026 come almost entirely from exposing code as a graph of definitions, callers, dependencies, and data flow — graph retrieval outperforms embedding retrieval by 23 percentage points on hidden-dependency tasks, plug-in repo graphs lift SWE-bench by tens of points, and cross-file is consistently the failure surface. Architectural discipline acts as a force multiplier on capability: SOTA proprietary models produce 0% hexagonal-direction violations under enforcement while open-weight models produce 80% with the same prompt. Folder layout, import topology, dependency direction, layered/hexagonal separation, and the pure-vs-effectful boundary are not aesthetic choices; they determine whether the dependency graph is legible at all, and they amplify whatever the model can do.

## 4. Module Sizing — Functions, Files, and Classes Sized for Effective Context (sizing)

**Impact:** HIGH
**Description:** Effective LLM context is far smaller than advertised: Claude 3.5 Sonnet drops from 29% to 3% on LongSWE-Bench as context grows from 32K to 256K tokens; Chroma's "Context Rot" study reports significant degradation at 50K tokens inside 200K-token windows. The corollary is sizing discipline: short files with cohesive purpose, functions decomposed to roughly six lines when behavior-preserving, classes with few methods, docstrings compressed to information content, and stripped formatting on critical paths save 24.5% of input tokens with negligible accuracy loss. LLM-specific cognitive complexity (LM-CC) predicts agent struggle better than McCabe — sizing rules should target the LLM, not the human reviewer.

## 5. Composition — Front-Load Semantics in Every File (composition)

**Impact:** HIGH
**Description:** LLM comprehension is empirically stronger at the start of files than the end, and explanatory comments measurably lift downstream task performance because they live in-distribution with pretraining corpora. File-level intent at the top, public types and exports before implementation, and WHY-not-WHAT comments are the highest-signal investments per token. They also pre-load the relevant region of vector space before the model reads the implementation.

## 6. Descriptors — The Architectural Map an Agent Reads First (descriptors)

**Impact:** HIGH
**Description:** Formal architecture descriptors reduce agent navigation steps by 33–44 percent and behavioral variance by 52 percent in field studies, regardless of file format. AGENTS.md and CLAUDE.md function as the orientation header for the entire repository, but single-file manifests stop scaling at roughly 10k lines — past that point, descriptors must tier (root contract, per-module specs, decision records). Without an explicit map, prompt wording silently fixes architecture ("vibe architecting") and the resulting decisions are unreviewable.

## 7. Monorepo Architecture — Workspaces, Boundaries, and Affected Graphs (monorepo)

**Impact:** HIGH
**Description:** Monorepos compound every other rule in this skill: a well-structured workspace gives agents one coherent vector-space to navigate, while a poorly-structured one fragments context across implicit boundaries the agent cannot see. Industry evidence at scale is unambiguous — Stripe's autonomous agents ship roughly 1,300 PRs per week into a hundreds-of-millions-of-lines monorepo only because rules are scoped per-subdirectory, not global; Cursor's auto-index hard-caps at 50,000 files; AGENTS.md spec mandates nearest-wins precedence. Tag-based package boundaries (Nx, Packwerk, Spring Modulith), affected-graph build systems (Bazel, Buck2, Turborepo, Nx), and tiered per-package descriptors are the three mechanical levers that keep the monorepo legible as it grows.

## 8. Gates — Mechanical Enforcement of the Ontology (gates)

**Impact:** CRITICAL
**Description:** Every property the prior sections prescribe must be mechanically enforced at write-time and merge-time, or it drifts. Type-checking and linting catch surface defects; structured-output validation catches LLM-produced contract violations; strong test oracles catch behavioral shortcuts (a third of "successful" agent patches on weak oracles reflect inadequate tests, not correct fixes); agent-comprehension re-derivation tests catch semantic drift between the code's intent and its current shape. Gates are the only mechanism that keeps the ontology hardened under agent authorship.

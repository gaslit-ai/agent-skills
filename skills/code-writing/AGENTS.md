# Code Writing

**Version 0.2.0**  
Duke Engineering  
May 2026

> **Note:**  
> This guide is optimized for agents and AI-assisted engineering workflows.
> It prioritizes deterministic behavior, explicit contracts, and maintainable defaults.

---

## Abstract

Rules for writing code so that the codebase itself is the knowledge graph an agentic AI consumes as it reads and writes. The hypothesis is that hardened rules covering identifier semantics, type and API-surface contracts, architecture and repository-graph layout, module sizing, in-file composition, architectural descriptors, monorepo workspace structure, and validation gates compound as the codebase grows: each additional file extends the orienting structure rather than fragmenting it, and reading the repo hierarchically co-locates the LLM in the appropriate region of vector space. Each reference separates source-backed empirical evidence (e.g., the 81% bug re-detection failure under semantic-preserving mutation; the 33–44% navigation-step reduction from formal architecture descriptors; the 0% vs 80% hexagonal-violation rate between SOTA proprietary and open-weight models; the Claude 3.5 Sonnet drop from 29% to 3% on LongSWE-Bench as context grows from 32K to 256K tokens; the 24.5% input-token reduction from stripped formatting; the +23.2pp graph-navigation gain over retrieval on hidden-dependency tasks) from derived authoring rules, with bad/good code examples. Synthesizes ~110 sources spanning code-as-knowledge-graph systems (RepoGraph ICLR 2025, CGM NeurIPS 2025, CodexGraph NAACL 2025, LocAgent ACL 2025, CodeCompass 2026, GraphCoder ASE 2024, CodePlan FSE 2024), repository-level agent benchmarks (SWE-bench ICLR 2024, SWE-agent NeurIPS 2024, SWE-Bench Pro 2025, Multi-SWE-bench 2025, SWE-PolyBench 2025, CodeScaleBench 2025, Agentless PACMSE 2025, DependEval ACL 2025, RepoBench ICLR 2024, BigCodeBench ICLR 2025, Long Code Arena 2024, LongCodeBench 2025, LoCoBench 2025, RepoQA 2024), architecture-conformance studies (Constraint Decay 2025, Quantitative Pattern Conformance 2025, The Modular Imperative Harvard 2024, Building Evolutionary Architectures 2nd ed 2023, ArchUnitTS, dependency-cruiser, ThoughtWorks dependency-drift fitness function, Hexagonal Architecture Explained Cockburn 2024, Strategic Monoliths and Microservices Vernon 2022, DDD4M IEEE TSE 2024), monorepo foundations and tooling (Google CACM 2016, Microsoft GVFS, Meta Sapling 2022/2025, SWE@Google book 2020, Bazel, Buck2 Meta 2023, Pants, Nx, Turborepo, Rush, moon, Lage, Stripe Minions 2025, Datadog AGENTS.md, Shopify Packwerk, Spring Modulith, CODEOWNERS-at-scale), identifier-semantics studies (Gao et al. naming 2023, When Names Disappear 2025, Empica 2024, How Accurately Do LLMs Understand Code 2025), type and schema-as-contract research (Outlines, XGrammar, SGLang NeurIPS 2024, Mündler PLDI 2025, Typed Holes OOPSLA 2024, JSONSchemaBench, BFCL ICML 2025, MCP spec, MCP-Bench 2025, Gorilla, ToolLLM, DocPrompting ICLR 2023, Ousterhout Philosophy of Software Design, Bloch How to Design a Good API, MCP Tool Descriptions Are Smelly 2026), module-sizing and complexity research (LongCodeBench 2025, Context Rot Chroma 2025, Hidden Cost of Readability 2025, ShortenDoc TOSEM 2025, Rethinking Code Complexity Through LLMs 2026, Class-Level Benchmark 2025, How Does Chunking Affect RAG 2025, Extract Method LLM 2025), in-file layout findings (Code Needs Comments ACL 2024, Lost in the Middle TACL 2024), and architectural-descriptor research (Formal Architecture Descriptors 2026, Codified Context 2026, Decoding CLAUDE.md Configurations 2025, AGENTS.md spec, Anthropic Context Engineering, Claude Code Best Practices) into rules covering identifiers, types and API surfaces, architecture and repository graph, module sizing, in-file composition, descriptors, monorepo architecture, and validation gates.

---

## Table of Contents

1. [Identifiers — Names as Vector-Space Anchors](#1-identifiers-—-names-as-vector-space-anchors) — **CRITICAL**
   - 1.1 [Use Descriptive Identifiers That State Intent, Not Abbreviations or Single Letters](#11-use-descriptive-identifiers-that-state-intent-not-abbreviations-or-single-letters)
   - 1.2 [Use One Canonical Name Per Concept Across the Entire Repository](#12-use-one-canonical-name-per-concept-across-the-entire-repository)
2. [Types & API Surfaces — Contracts the Compiler and Decoder Both Enforce](#2-types-&-api-surfaces-—-contracts-the-compiler-and-decoder-both-enforce) — **CRITICAL**
   - 2.1 [Annotate Every Public Signature With Specific, Non-any Types](#21-annotate-every-public-signature-with-specific-non-any-types)
   - 2.2 [Define and Schema-Validate Every Structured Output Cross-Boundary](#22-define-and-schema-validate-every-structured-output-cross-boundary)
   - 2.3 [Design Narrow, Deep Public API Surfaces; Curate Re-Exports Deliberately](#23-design-narrow-deep-public-api-surfaces-curate-re-exports-deliberately)
3. [Architecture & Repository Graph — Files, Folders, Imports, and Dependency Direction](#3-architecture-&-repository-graph-—-files,-folders,-imports,-and-dependency-direction) — **CRITICAL**
   - 3.1 [Encode Architecture as Executable Fitness Functions, Not Prose](#31-encode-architecture-as-executable-fitness-functions-not-prose)
   - 3.2 [Forbid Import Cycles and Publish Module Surfaces via Explicit Index Files](#32-forbid-import-cycles-and-publish-module-surfaces-via-explicit-index-files)
   - 3.3 [Make Dependency Direction Explicit; Domain Points Inward, Adapters Point Out](#33-make-dependency-direction-explicit-domain-points-inward-adapters-point-out)
   - 3.4 [Make Folder Structure Mirror the Module Dependency Graph](#34-make-folder-structure-mirror-the-module-dependency-graph)
   - 3.5 [Separate the Functional Core From the Imperative Shell; Push Effects to the Edge](#35-separate-the-functional-core-from-the-imperative-shell-push-effects-to-the-edge)
4. [Module Sizing — Functions, Files, and Classes Sized for Effective Context](#4-module-sizing-—-functions,-files,-and-classes-sized-for-effective-context) — **HIGH**
   - 4.1 [Keep Functions Small and Files Cohesive; Bound by LLM Cognitive Complexity, Not McCabe](#41-keep-functions-small-and-files-cohesive-bound-by-llm-cognitive-complexity-not-mccabe)
   - 4.2 [Treat the LLM's Effective Context as a Hard Budget; Optimize Token Density](#42-treat-the-llms-effective-context-as-a-hard-budget-optimize-token-density)
5. [Composition — Front-Load Semantics in Every File](#5-composition-—-front-load-semantics-in-every-file) — **HIGH**
   - 5.1 [Front-Load Every File With a Module-Intent Header and Public Surface](#51-front-load-every-file-with-a-module-intent-header-and-public-surface)
   - 5.2 [Write Comments That Explain WHY, Not WHAT — Especially at Non-Obvious Constraints](#52-write-comments-that-explain-why-not-what--especially-at-non-obvious-constraints)
6. [Descriptors — The Architectural Map an Agent Reads First](#6-descriptors-—-the-architectural-map-an-agent-reads-first) — **HIGH**
   - 6.1 [Maintain a Tiered AGENTS.md Map — Root Contract, Per-Module Specs, Sub-Agent Definitions](#61-maintain-a-tiered-agentsmd-map--root-contract-per-module-specs-sub-agent-definitions)
   - 6.2 [Record Every Non-Obvious Design Decision as an ADR](#62-record-every-non-obvious-design-decision-as-an-adr)
7. [Monorepo Architecture — Workspaces, Boundaries, and Affected Graphs](#7-monorepo-architecture-—-workspaces,-boundaries,-and-affected-graphs) — **HIGH**
   - 7.1 [Enforce Tag-Based Package Boundaries So Workspaces Form a Layered Dependency Graph](#71-enforce-tag-based-package-boundaries-so-workspaces-form-a-layered-dependency-graph)
   - 7.2 [Expose the Affected/Build Graph as the Agent's Primary Navigation Primitive](#72-expose-the-affectedbuild-graph-as-the-agents-primary-navigation-primitive)
   - 7.3 [Place AGENTS.md at Every Package Root; Nearest-File-Wins as Default](#73-place-agentsmd-at-every-package-root-nearest-file-wins-as-default)
8. [Gates — Mechanical Enforcement of the Ontology](#8-gates-—-mechanical-enforcement-of-the-ontology) — **CRITICAL**
   - 8.1 [Gate Every Commit With Strict Type-Checking and Naming/Style Lint](#81-gate-every-commit-with-strict-type-checking-and-namingstyle-lint)
   - 8.2 [Test With Strong Oracles and Add Agent-Comprehension Re-Derivation Checks](#82-test-with-strong-oracles-and-add-agent-comprehension-re-derivation-checks)

---

## 1. Identifiers — Names as Vector-Space Anchors

**Impact: CRITICAL**

Identifier obfuscation is the single most damaging transformation for LLM code comprehension — accuracy on intent-level tasks collapses while behavior-tracing persists, evidence that names carry the semantic signal models actually use. Misleading or inconsistent names actively poison agent reasoning because LLMs trust naming over deeper analysis. Names are the codebase's primary ontology layer; every other rule in this skill compounds with naming discipline.

### 1.1 Use Descriptive Identifiers That State Intent, Not Abbreviations or Single Letters

**Impact: CRITICAL**

Identifier obfuscation produces the largest single performance drop of any code transformation studied in LLM comprehension experiments. Gao et al.'s controlled study across multiple LLMs and code-analysis tasks reports that variable renaming degrades performance more than dead-code removal or control-flow scrambling — descriptive names achieve 34.2% exact-match completion versus 16.6% for obfuscated names. The 2025 "When Names Disappear" experiment strips identifiers and shows intent-level comprehension collapses to line-by-line narration while behavior-tracing persists, evidence that names — not control structure — carry the conceptual layer LLMs consume. Empica (2024) corroborates: LLMs trust surface naming over deeper analysis, so misleading names actively poison agent reasoning rather than merely obscuring it.

**Incorrect: single-letter and unsemantic abbreviations — agent must reconstruct intent from usage**

```ts
function p(d: any[], f: any): any[] {
  const r = [];
  for (const x of d) {
    if (f(x)) r.push(x);
  }
  return r;
}

const u = await fetch('/u').then(r => r.json());
const a = u.filter((x: any) => x.s === 'A');
```

**Correct: identifiers state the intent the LLM should consume directly**

```ts
function filterMatchingItems<TItem>(
  items: readonly TItem[],
  predicate: (item: TItem) => boolean
): TItem[] {
  return items.filter(predicate);
}

const billingCustomers = await fetchBillingCustomers();
const activeBillingCustomers = billingCustomers.filter(
  (customer) => customer.accountStatus === 'active'
);
```

Reference: [https://arxiv.org/abs/2307.12488](https://arxiv.org/abs/2307.12488), [https://arxiv.org/abs/2510.03178](https://arxiv.org/abs/2510.03178), [https://arxiv.org/abs/2407.03611](https://arxiv.org/abs/2407.03611), [https://arxiv.org/abs/2504.04372](https://arxiv.org/abs/2504.04372), [https://arxiv.org/abs/2411.01414](https://arxiv.org/abs/2411.01414)

### 1.2 Use One Canonical Name Per Concept Across the Entire Repository

**Impact: CRITICAL**

When the same domain concept appears under multiple labels (`Customer`, `Client`, `User`, `Account` for the same legal entity), LLM agents lose the cross-file edge that would otherwise let them traverse the repository as a graph. Multi-SWE-bench (2025) and CrossCodeEval (NeurIPS 2023) both report sharp accuracy drops on cross-file edits, and DependEval (ACL 2025) isolates dependency-recognition as a gating skill that fails when terminology drifts. Liu et al.'s coding-style consistency study (2024) shows agents inherit and amplify their training corpus's style priors — a codebase with inconsistent naming trains every subsequent agent edit to be more inconsistent. The strongest signal for cross-file agent comprehension is that any concept resolves to exactly one identifier from any call site.

**Incorrect: the same domain entity surfaces under three competing labels — agent cannot link related files**

```ts
// services/billing.ts
export interface Customer { id: string; balance: number; }

// services/identity.ts
export interface User { id: string; email: string; }

// services/compliance.ts
export interface Account { id: string; jurisdiction: string; }

// callers must triangulate that Customer.id === User.id === Account.id
```

**Correct: one canonical term; specializations declare their relation to it**

```ts
// domain/legal-party.ts — the single canonical identifier
export interface LegalParty {
  legalPartyId: LegalPartyId;
  displayName: string;
}
export type LegalPartyId = string & { readonly __brand: 'LegalPartyId' };

// services/billing.ts
import type { LegalPartyId } from '../domain/legal-party';
export interface BillingProfile {
  legalPartyId: LegalPartyId;
  balanceMinorUnits: number;
}

// services/identity.ts
import type { LegalPartyId } from '../domain/legal-party';
export interface AuthenticationProfile {
  legalPartyId: LegalPartyId;
  primaryEmail: string;
}
```

Reference: [https://arxiv.org/abs/2504.02605](https://arxiv.org/abs/2504.02605), [https://arxiv.org/abs/2310.11248](https://arxiv.org/abs/2310.11248), [https://aclanthology.org/2025.findings-acl.373.pdf](https://aclanthology.org/2025.findings-acl.373.pdf), [https://arxiv.org/abs/2407.00456](https://arxiv.org/abs/2407.00456), [https://arxiv.org/abs/2306.03091](https://arxiv.org/abs/2306.03091)

---

## 2. Types & API Surfaces — Contracts the Compiler and Decoder Both Enforce

**Impact: CRITICAL**

Types, schemas, and public-surface APIs are enforceable at both compile-time and LLM decode-time, making them the only contracts that hold under agent authorship. Type-constrained generation cuts compile errors by more than half and lifts functional correctness; typed-hole context produces the largest single accuracy gain for LLM completion. The public API of every module is simultaneously a runtime contract and the agent's retrieval index — DocPrompting shows a 52% relative Pass@1 lift when docs/types are retrievable at generation time. Narrow, well-documented surfaces win because they are cheaper to attend to and harder to misuse.

### 2.1 Annotate Every Public Signature With Specific, Non-any Types

**Impact: CRITICAL**

Type information is the strongest non-natural-language ground truth available to an LLM reasoning about code. Mündler et al.'s PLDI 2025 study on type-constrained code generation reports that enforcing well-typedness at decode time reduces compilation errors by more than 50% and raises functional correctness across HumanEval and MBPP. Blinn et al.'s OOPSLA 2024 study of typed holes shows that type definitions alone — without surrounding code — produce the largest single accuracy gain on the MVUBench completion benchmark, evidence that type signatures densely encode intent. SWE-Bench Pro's failure analysis traces a large class of false negatives to interface mismatches between agent solutions and unit-test expectations: agents fix the wrong shape because the right shape was never typed. `any`, missing return types, and untyped object parameters are not stylistic choices — they erase the orienting signal models depend on.

**Incorrect: signature gives the agent no type-shaped grounding**

```ts
export function process(data: any, options: any) {
  if (options.mode === 'sum') return data.reduce((a, b) => a + b.amount, 0);
  if (options.mode === 'count') return data.length;
  return null;
}
```

**Correct: discriminated input, explicit return, branded primitives**

```ts
export type AmountMinorUnits = number & { readonly __brand: 'AmountMinorUnits' };

export interface LedgerEntry {
  readonly entryId: string;
  readonly amountMinorUnits: AmountMinorUnits;
}

export type LedgerSummaryRequest =
  | { readonly mode: 'sum' }
  | { readonly mode: 'count' };

export interface LedgerSummary {
  readonly mode: LedgerSummaryRequest['mode'];
  readonly value: number;
}

export function summarizeLedgerEntries(
  entries: readonly LedgerEntry[],
  request: LedgerSummaryRequest
): LedgerSummary {
  switch (request.mode) {
    case 'sum':
      return {
        mode: 'sum',
        value: entries.reduce((total, entry) => total + entry.amountMinorUnits, 0),
      };
    case 'count':
      return { mode: 'count', value: entries.length };
  }
}
```

Reference: [https://arxiv.org/abs/2504.09246](https://arxiv.org/abs/2504.09246), [https://arxiv.org/abs/2409.00921](https://arxiv.org/abs/2409.00921), [https://arxiv.org/abs/2303.09564](https://arxiv.org/abs/2303.09564), [https://arxiv.org/abs/2509.16941](https://arxiv.org/abs/2509.16941), [https://arxiv.org/abs/2411.01414](https://arxiv.org/abs/2411.01414)

### 2.2 Define and Schema-Validate Every Structured Output Cross-Boundary

**Impact: CRITICAL**

Schemas are the only contracts that hold mechanically across the LLM/code boundary. Outlines (Willard & Louf 2023) reformulates LLM generation as finite-state transitions indexed against the vocabulary, making schema enforcement essentially free at decode time; XGrammar (Dong et al. 2024) achieves up to 100× speedup and is now the default backend in vLLM, SGLang, and TensorRT-LLM. JSONSchemaBench (Microsoft Research + EPFL 2025) benchmarks 10K real-world JSON Schemas from GitHub, Kubernetes, and API specs across guidance engines, establishing JSON Schema as the canonical inter-system contract. The Model Context Protocol (Anthropic, Nov 2024 — adopted by OpenAI and Google) is the same principle applied to tool surfaces: typed JSON-RPC primitives form the lingua franca agents speak to systems. Cross-boundary data with no schema is data the agent must reconstruct from prose — a guessing problem the literature has shown is brittle and unverifiable.

**Incorrect: unvalidated JSON crosses an LLM boundary — runtime errors and silent contract drift**

```ts
const response = await llm.complete({
  prompt: 'Extract billing event as JSON',
  text: invoiceText,
});

// trust the model; pray the keys exist
const event = JSON.parse(response.content);
await ledger.recordEvent(event.amount, event.currency, event.customerId);
```

**Correct: schema is the contract; validate at every crossing**

```ts
import { z } from 'zod';

export const BillingEventSchema = z.object({
  amountMinorUnits: z.number().int().nonnegative(),
  currency: z.enum(['USD', 'EUR', 'GBP']),
  legalPartyId: z.string().min(1),
  occurredAt: z.string().datetime(),
});
export type BillingEvent = z.infer<typeof BillingEventSchema>;

const rawResponse = await llm.complete({
  prompt: 'Extract billing event as JSON',
  text: invoiceText,
  responseFormat: { type: 'json_schema', schema: BillingEventSchema },
});

const parsed = BillingEventSchema.safeParse(JSON.parse(rawResponse.content));
if (!parsed.success) {
  throw new BillingEventContractError(parsed.error);
}
await ledger.recordEvent(parsed.data);
```

Reference: [https://arxiv.org/abs/2307.09702](https://arxiv.org/abs/2307.09702), [https://arxiv.org/abs/2411.15100](https://arxiv.org/abs/2411.15100), [https://arxiv.org/abs/2501.10868](https://arxiv.org/abs/2501.10868), [https://arxiv.org/abs/2312.07104](https://arxiv.org/abs/2312.07104), [https://modelcontextprotocol.io/specification/2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25), [https://openreview.net/forum?id=2GmDdhBdDk](https://openreview.net/forum?id=2GmDdhBdDk)

### 2.3 Design Narrow, Deep Public API Surfaces; Curate Re-Exports Deliberately

**Impact: CRITICAL**

The public surface of every module is simultaneously a runtime contract and the agent's retrieval index — what the agent searches against, scrolls through, and grounds tool-calls in. Ousterhout's "deep modules, narrow interfaces" doctrine (maximize functionality / interface complexity) is the structural primitive; Bloch's "easy to use, hard to misuse" is the agent-tractable restatement. BigCodeBench (ICLR 2025) reports that the best LLMs score ~60% vs 97% human, with failures concentrated in *compositional* API use — getting the right combination of functions called with the right outputs threaded. MCP-Bench (NeurIPS 2025) and the "MCP Tool Descriptions Are Smelly!" study (arXiv 2602.14878) find 97.1% of public MCP tool descriptions contain quality smells and 56% fail to state purpose clearly; description-only refinements drove SOTA SWE-bench Verified gains. The corollary for an `index.ts` / `mod.rs` / package surface: re-export the minimum coherent set with intentional, agent-readable naming; bulk barrels that dump everything ("export * from ...") destroy both build performance (Atlassian: 75% faster builds removing barrels) and the agent's signal-to-noise ratio.

**Incorrect: everything exported, no curated surface, ambiguous shapes**

```ts
// src/services/billing/index.ts — agent has no idea what is "public"
export * from './billing.service';
export * from './billing.repository';
export * from './billing.cache';
export * from './internal/legacy-billing-helpers';
export * from './internal/migration-2024-q3';

// callers see hundreds of symbols; many shouldn't exist outside the module
```

**Correct: curated narrow surface + descriptive doc comments that double as retrieval index**

```ts
// src/services/billing/index.ts
//
// Public surface of the billing service. Everything not re-exported here is
// internal to the module and may be renamed or removed without notice.

/** A customer's billing summary at a point in time. */
export type { BillingSummary } from './billing.types';

/**
 * BillingService — orchestrates billing reads and writes against the ledger.
 *
 * Use this from API handlers and scheduled jobs. Do NOT instantiate inside
 * domain code; pass it in via constructor injection so it is testable.
 *
 * @example
 * const summary = await billingService.summarize(legalPartyId);
 */
export { BillingService } from './billing.service';

/** Thrown when a billing operation cannot resolve a customer to a ledger account. */
export { BillingResolutionError } from './billing.errors';
```

Reference: [https://web.stanford.edu/~ouster/cgi-bin/cs190-spring16/lecture.php?topic=modularDesign](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring16/lecture.php?topic=modularDesign), [https://research.google.com/pubs/archive/32713.pdf](https://research.google.com/pubs/archive/32713.pdf), [https://arxiv.org/abs/2406.15877](https://arxiv.org/abs/2406.15877), [https://arxiv.org/abs/2602.14878](https://arxiv.org/abs/2602.14878), [https://www.anthropic.com/engineering/writing-tools-for-agents](https://www.anthropic.com/engineering/writing-tools-for-agents), [https://arxiv.org/abs/2207.05987](https://arxiv.org/abs/2207.05987), [https://www.atlassian.com/blog/atlassian-engineering/faster-builds-when-removing-barrel-files](https://www.atlassian.com/blog/atlassian-engineering/faster-builds-when-removing-barrel-files)

---

## 3. Architecture & Repository Graph — Files, Folders, Imports, and Dependency Direction

**Impact: CRITICAL**

Repository-level coding gains from 2023–2026 come almost entirely from exposing code as a graph of definitions, callers, dependencies, and data flow — graph retrieval outperforms embedding retrieval by 23 percentage points on hidden-dependency tasks, plug-in repo graphs lift SWE-bench by tens of points, and cross-file is consistently the failure surface. Architectural discipline acts as a force multiplier on capability: SOTA proprietary models produce 0% hexagonal-direction violations under enforcement while open-weight models produce 80% with the same prompt. Folder layout, import topology, dependency direction, layered/hexagonal separation, and the pure-vs-effectful boundary are not aesthetic choices; they determine whether the dependency graph is legible at all, and they amplify whatever the model can do.

### 3.1 Encode Architecture as Executable Fitness Functions, Not Prose

**Impact: CRITICAL**

Prose architecture documents drift the moment the first agent merges a PR; executable fitness functions do not. "Building Evolutionary Architectures, 2nd ed." (Ford/Parsons/Kua/Sadalage, 2023) codifies the discipline of expressing every architectural invariant as a runnable check. The "Quantitative Analysis of Technical Debt and Pattern Conformance in AI-Synthesized Microservices" study (arXiv 2512.04273, 2025) measures this empirically: under Hexagonal Architecture rules enforced mechanically, GPT-5.1 produced 0% direction-violations while Llama 3 8B produced 80% (illegal circular dependencies). Same prompt, same model family lineage — the gap is entirely explained by whether the architecture was *enforced* or merely *described*. ArchUnit (Java), ArchUnitTS, dependency-cruiser, ts-arch, and Packwerk are the canonical mechanisms; ThoughtWorks Technology Radar (Vol 31, Oct 2024) explicitly recommends "dependency drift fitness function" as a tracked metric. The skill's hypothesis — code as the LLM's orienting knowledge graph — only works if the graph stays well-formed under agent edits, and only fitness functions guarantee that.

**Incorrect: architecture asserted in a README, enforced nowhere**

```md
<!-- docs/architecture.md -->

# Architecture

- Domain code never imports services.
- Services never import HTTP/transport layer.
- Repositories implement interfaces defined in domain.

(There is no test, no lint rule, no CI gate. The next agent will violate at least one.)
```

**Correct: rules expressed as runnable dependency-cruiser config, gated in CI**

```js
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-services',
      severity: 'error',
      comment: 'Domain types are pure; they MUST NOT depend on services or transport.',
      from: { path: '^src/domain' },
      to:   { path: '^src/(services|transport)' },
    },
    {
      name: 'no-services-to-transport',
      severity: 'error',
      comment: 'Services MUST NOT depend on HTTP/transport (hexagonal direction).',
      from: { path: '^src/services' },
      to:   { path: '^src/transport' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Cycles break hierarchical localization and confuse repo-graph retrieval.',
      from: {},
      to:   { circular: true },
    },
  ],
  options: { tsConfig: { fileName: 'tsconfig.json' } },
};

// package.json
{
  "scripts": {
    "lint:arch": "depcruise --config .dependency-cruiser.cjs --validate src",
    "verify": "pnpm typecheck && pnpm lint && pnpm lint:arch && pnpm test"
  }
}
```

Reference: [https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/), [https://arxiv.org/pdf/2512.04273](https://arxiv.org/pdf/2512.04273), [https://namin.seas.harvard.edu/pubs/lmpl-modularity.pdf](https://namin.seas.harvard.edu/pubs/lmpl-modularity.pdf), [https://www.thoughtworks.com/radar/techniques/dependency-drift-fitness-function](https://www.thoughtworks.com/radar/techniques/dependency-drift-fitness-function), [https://github.com/sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser), [https://lukasniessen.github.io/ArchUnitTS/](https://lukasniessen.github.io/ArchUnitTS/), [https://shopify.engineering/enforcing-modularity-rails-apps-packwerk](https://shopify.engineering/enforcing-modularity-rails-apps-packwerk)

### 3.2 Forbid Import Cycles and Publish Module Surfaces via Explicit Index Files

**Impact: CRITICAL**

GraphCoder (ASE 2024) demonstrates that retrieval over a control-flow plus data-dependence Code Context Graph outperforms sequence-based retrieval by a wide margin — but only when the graph is well-formed. Import cycles, deep relative paths (`../../../utils/...`), and wildcard re-exports collapse the graph back into a flat soup that the agent must re-parse. AutoCodeRover (ISSTA 2024) reaches 46.2% on SWE-bench Verified specifically by searching via classes and methods rather than text, which requires that each module expose a typed surface. Long Code Arena (JetBrains 2024) shows that even when the relevant context fits in the model's context window, agents fail to locate it in repos where the module surface is implicit — the agent cannot scan an `index.ts` it does not exist. Cycles, in particular, are corrosive: they make the dependency relation symmetric where it should be a partial order, which destroys the hierarchical-localization signal the agent depends on.

**Incorrect: cycle + deep relative imports + unbounded re-exports**

```ts
// src/services/billing/billing.service.ts
import { IdentityService } from '../../identity/identity.service';
// src/services/identity/identity.service.ts
import { BillingService } from '../../billing/billing.service';  // <-- cycle

// src/utils/index.ts
export * from '../services/billing/billing.repository';  // leaks internals
export * from '../services/identity/identity.repository';
```

**Correct: acyclic deps via shared domain layer; each module exposes only its public surface**

```ts
// src/domain/legal-party/index.ts — typed surface, nothing else exposed
export type { LegalParty, LegalPartyId } from './legal-party.types';
export { createLegalParty, isLegalParty } from './legal-party';

// src/services/billing/index.ts
export type { BillingProfile } from './billing.types';
export { BillingService } from './billing.service';

// src/services/billing/billing.service.ts
import type { LegalPartyId } from '@/domain/legal-party';
// note: no import from identity; both depend on domain, not on each other.

// src/services/identity/index.ts
export type { AuthenticationProfile } from './identity.types';
export { IdentityService } from './identity.service';
```

Reference: [https://arxiv.org/abs/2406.07003](https://arxiv.org/abs/2406.07003), [https://arxiv.org/abs/2404.05427](https://arxiv.org/abs/2404.05427), [https://arxiv.org/abs/2406.11612](https://arxiv.org/abs/2406.11612), [https://arxiv.org/abs/2410.14684](https://arxiv.org/abs/2410.14684), [https://arxiv.org/abs/2303.12570](https://arxiv.org/abs/2303.12570)

### 3.3 Make Dependency Direction Explicit; Domain Points Inward, Adapters Point Out

**Impact: CRITICAL**

The two empirical results that justify dependency-direction discipline as a CRITICAL rule are: (a) the 0%-vs-80% hexagonal-violation gap between SOTA and open-weight models under enforcement, from the "Quantitative Pattern Conformance" study (arXiv 2512.04273), and (b) LocAgent (ACL 2025) achieving 92.7% file-level localization and +12% Pass@10 on issue resolution specifically through multi-hop reasoning over directed code graphs. Direction is the property that makes a code graph *useful for navigation* rather than just present. Cockburn's 2024 "Hexagonal Architecture Explained" is the definitive modern restatement: domain inside, ports as narrow contracts, adapters absorbing transport/persistence complexity. Mark Seemann's 2025 "Ports and Fat Adapters" essay is the necessary counterweight — naive "port every IO" rules produce shallow modules; ports should stay narrow while adapters carry weight. Vertical Slice Architecture (Jimmy Bogard) is often a better fit than horizontal layered Clean Architecture for agent navigation because it co-locates everything a feature needs in one path — but the dependency-direction rule (feature → shared infrastructure, never the reverse) still holds.

**Incorrect: domain reaches into HTTP and DB layers; dependency direction inverted**

```ts
// src/domain/legal-party.ts — domain depends on transport and infra
import express from 'express';                            // wrong direction
import { dbPool } from '../infra/postgres-pool';           // wrong direction

export class LegalParty {
  static async find(req: express.Request): Promise<LegalParty> {
    const row = await dbPool.query('SELECT ...');          // domain owns SQL
    return new LegalParty(row);
  }
}
```

**Correct: domain knows only its own types; adapters depend on domain ports, never reverse**

```ts
// src/domain/legal-party/legal-party.ts — no transport or infra imports
import type { LegalPartyId } from './legal-party.types';

export interface LegalParty {
  readonly legalPartyId: LegalPartyId;
  readonly displayName: string;
}

// Port: declared by domain; signature is the contract.
export interface LegalPartyRepository {
  findById(id: LegalPartyId): Promise<LegalParty | null>;
}

// src/adapters/postgres/postgres-legal-party-repository.ts
// Adapter depends on domain (correct direction); domain knows nothing about it.
import type { LegalParty, LegalPartyId, LegalPartyRepository }
  from '@/domain/legal-party';
import type { Pool } from 'pg';

export class PostgresLegalPartyRepository implements LegalPartyRepository {
  constructor(private readonly pool: Pool) {}
  async findById(id: LegalPartyId): Promise<LegalParty | null> {
    const result = await this.pool.query(
      'SELECT legal_party_id, display_name FROM legal_parties WHERE legal_party_id = $1',
      [id],
    );
    return result.rows[0] ? toLegalParty(result.rows[0]) : null;
  }
}
```

Reference: [https://www.amazon.com/Hexagonal-Architecture-Explained-architecture-simplifies/dp/B0F5QSH28F](https://www.amazon.com/Hexagonal-Architecture-Explained-architecture-simplifies/dp/B0F5QSH28F), [https://blog.ploeh.dk/2025/04/01/ports-and-fat-adapters/](https://blog.ploeh.dk/2025/04/01/ports-and-fat-adapters/), [https://arxiv.org/pdf/2512.04273](https://arxiv.org/pdf/2512.04273), [https://arxiv.org/abs/2503.09089](https://arxiv.org/abs/2503.09089), [https://arxiv.org/abs/2410.14684](https://arxiv.org/abs/2410.14684), [https://www.oreilly.com/library/view/strategic-monoliths-and/9780137355600/](https://www.oreilly.com/library/view/strategic-monoliths-and/9780137355600/), [https://aimjournals.com/index.php/ijaair/article/download/413/363/874](https://aimjournals.com/index.php/ijaair/article/download/413/363/874)

### 3.4 Make Folder Structure Mirror the Module Dependency Graph

**Impact: CRITICAL**

The dominant gains in repository-level coding agents from 2023 onward come from exposing code as a graph the agent can traverse rather than a bag of files. RepoGraph (ICLR 2025) yields a 32.8% relative improvement on SWE-bench by constructing an explicit repo-level graph; Code Graph Model (NeurIPS 2025) bakes graph structure into LLM attention and reaches 43% on SWE-bench Lite with open Qwen weights; CodexGraph (NAACL 2025) exposes the repo as a queryable Neo4j-style database so the agent issues Cypher queries to locate symbols. Agentless (Xia et al. PACMSE 2025) beat full agent scaffolds on SWE-bench Lite using a three-stage hierarchical localizer (file → class/function → edit location) — concrete evidence that codebases admitting such hierarchical narrowing are agent-tractable. The corollary: folder hierarchy that does not match module boundaries forces the agent to reconstruct the graph from text, and it loses cross-file edges in the process.

**Incorrect: flat or implementation-detail layout — module graph not legible from folder structure**

```typescript
src/
  utils.ts
  helpers.ts
  customer.ts
  customerHelpers.ts
  customerUtils.ts
  billing.ts
  billingHelpers.ts
  index.ts
```

**Correct: folder structure encodes the module graph; each folder is one cohesive concept**

```typescript
src/
  domain/
    legal-party/
      legal-party.types.ts
      legal-party.ts
      index.ts        // public surface only
    billing-event/
      billing-event.types.ts
      billing-event.ts
      index.ts
  services/
    billing/
      billing.service.ts
      billing.repository.ts
      index.ts
    identity/
      identity.service.ts
      index.ts
  app/
    routes.ts
    server.ts
```

Reference: [https://arxiv.org/abs/2410.14684](https://arxiv.org/abs/2410.14684), [https://arxiv.org/abs/2505.16901](https://arxiv.org/abs/2505.16901), [https://aclanthology.org/2025.naacl-long.7/](https://aclanthology.org/2025.naacl-long.7/), [https://arxiv.org/abs/2407.01489](https://arxiv.org/abs/2407.01489), [https://arxiv.org/abs/2309.12499](https://arxiv.org/abs/2309.12499), [https://joern.io/impact/](https://joern.io/impact/)

### 3.5 Separate the Functional Core From the Imperative Shell; Push Effects to the Edge

**Impact: HIGH**

Gary Bernhardt's "Functional Core, Imperative Shell" pattern — pure decision logic at the center, all I/O and effects pushed to a thin imperative shell at the edge — was endorsed by Google's official testing blog in October 2025, a strong signal it has gone mainstream at scale. The "Constraint Decay" study (arXiv 2605.06445, 2025) shows agents producing functional code degrade non-linearly as architecture, DB, and ORM constraints stack — implying the most reliable agent-authored code is the part that has no constraints to violate (pure functions on plain data). The 14.ai production case study (ZenML LLMOps DB 2024) reports Effect-TS's compile-time-verified dependency injection raised agent-system reliability across LLM provider boundaries. The corollary for agent-authored code: pure cores are easy for agents to test, easy to reason about, and easy to mutation-test; imperative shells should be small enough to inspect by eye. Result types and discriminated-union errors (neverthrow, Effect, native TypeScript) outperform thrown exceptions because both branches appear in the signature — the agent cannot accidentally swallow an error path it cannot see.

**Incorrect: pure logic and side effects entangled; exceptions hide the failure path**

```ts
async function processInvoice(invoiceId: string) {
  const invoice = await db.invoices.findById(invoiceId);     // I/O
  if (!invoice) throw new Error('not found');                 // hidden branch
  const tax = invoice.amount * 0.0875;                        // pure
  const total = invoice.amount + tax;                          // pure
  await db.invoices.update(invoiceId, { total });             // I/O
  await emailService.send(invoice.customerEmail, total);      // I/O
  return total;
}
```

**Correct: pure core; imperative shell handles all I/O; errors surface in signatures**

```ts
// src/domain/invoice/invoice.ts — pure core, no I/O imports
export type InvoiceCalculation =
  | { readonly kind: 'ok'; readonly total: number; readonly tax: number }
  | { readonly kind: 'invalid'; readonly reason: 'negative-amount' };

export function calculateInvoiceTotal(amount: number): InvoiceCalculation {
  if (amount < 0) return { kind: 'invalid', reason: 'negative-amount' };
  const tax = amount * 0.0875;
  return { kind: 'ok', total: amount + tax, tax };
}

// src/services/invoice/invoice.service.ts — imperative shell, thin and inspectable
import type { Result } from '@/shared/result';
import { calculateInvoiceTotal } from '@/domain/invoice';

export async function processInvoice(
  invoiceId: InvoiceId,
  deps: { db: InvoiceRepository; mail: MailGateway },
): Promise<Result<{ total: number }, ProcessInvoiceError>> {
  const invoice = await deps.db.findById(invoiceId);
  if (!invoice) return { ok: false, error: { kind: 'not-found', invoiceId } };

  const calc = calculateInvoiceTotal(invoice.amount);
  if (calc.kind !== 'ok') return { ok: false, error: { kind: 'invalid', reason: calc.reason } };

  await deps.db.update(invoiceId, { total: calc.total });
  await deps.mail.send(invoice.customerEmail, calc.total);
  return { ok: true, value: { total: calc.total } };
}
```

Reference: [https://testing.googleblog.com/2025/10/simplify-your-code-functional-core.html](https://testing.googleblog.com/2025/10/simplify-your-code-functional-core.html), [https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell), [https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks), [https://arxiv.org/abs/2605.06445](https://arxiv.org/abs/2605.06445), [https://www.zenml.io/llmops-database/building-reliable-ai-agent-systems-with-effect-typescript-framework](https://www.zenml.io/llmops-database/building-reliable-ai-agent-systems-with-effect-typescript-framework), [https://www.solberg.is/neverthrow](https://www.solberg.is/neverthrow), [https://effect.website/](https://effect.website/)

---

## 4. Module Sizing — Functions, Files, and Classes Sized for Effective Context

**Impact: HIGH**

Effective LLM context is far smaller than advertised: Claude 3.5 Sonnet drops from 29% to 3% on LongSWE-Bench as context grows from 32K to 256K tokens; Chroma's "Context Rot" study reports significant degradation at 50K tokens inside 200K-token windows. The corollary is sizing discipline: short files with cohesive purpose, functions decomposed to roughly six lines when behavior-preserving, classes with few methods, docstrings compressed to information content, and stripped formatting on critical paths save 24.5% of input tokens with negligible accuracy loss. LLM-specific cognitive complexity (LM-CC) predicts agent struggle better than McCabe — sizing rules should target the LLM, not the human reviewer.

### 4.1 Keep Functions Small and Files Cohesive; Bound by LLM Cognitive Complexity, Not McCabe

**Impact: HIGH**

LLM-observed difficulty is empirically different from human-observed difficulty. "Rethinking Code Complexity Through the Lens of LLMs" (arXiv 2602.07882) introduces LM-CC (Language Model Cognitive Complexity) and reports that **LM-CC correlates more strongly with LLM task performance than Campbell's cognitive complexity or McCabe's cyclomatic complexity** — and semantics-preserving transformations that reduce LM-CC consistently improve LLM accuracy. "What is wrong with your code generated by LLMs" (Sci. China Info. Sci. 2025) finds LLMs produce code that is *shorter yet more cyclomatically complex* than canonical solutions, with accuracy degrading sharply as cyclomatic complexity rises. The "Automated Extract Method Refactoring with Open-Source LLMs" study (arXiv 2510.26480, Oct 2025) demonstrates that LLM-driven decomposition can reduce LOC/method from 12.10 to 6.19 while preserving behavior — meaning small functions are not just stylistically preferred, they are empirically tractable. The Class-Level Benchmark study (arXiv 2504.15564, 2025) reports LLMs perform substantially worse on class-level tasks than function-level, with Pass@1 dropping as method count grows. Practical bounds: target functions ≤ ~30 LOC, files ≤ ~300 LOC, classes with ≤ ~7 public methods — but enforce against LM-CC where tooling permits, not against McCabe in isolation.

**Incorrect: one 200-line function entangling validation, transformation, persistence, notification**

```ts
export async function handleOrder(input: unknown): Promise<unknown> {
  // 25 lines of input validation
  if (typeof input !== 'object' || input === null) throw new Error('bad');
  // ... (many more checks)
  // 40 lines of transformation
  const items = (input as any).items.map((i: any) => { /* ... */ });
  // 30 lines of pricing
  let subtotal = 0;
  for (const item of items) { /* ... */ }
  // 25 lines of tax calculation
  // 40 lines of persistence
  // 40 lines of notification
  // total: 200 LOC, McCabe ~22, LM-CC even higher
}
```

**Correct: each function does one thing; LOC and complexity bounded; agent can read, mutate, and test each independently**

```ts
// each function ~6–20 lines; pure where possible
export function parseOrderInput(input: unknown): Result<OrderInput, ParseError> {
  return OrderInputSchema.safeParse(input);
}

export function priceOrder(items: readonly OrderItem[]): PricedOrder {
  const subtotal = items.reduce((sum, item) => sum + item.unitPriceMinorUnits * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE_BASIS_POINTS / 10_000);
  return { subtotal, tax, total: subtotal + tax };
}

export async function recordOrder(
  order: PricedOrder,
  deps: { orders: OrderRepository },
): Promise<Result<OrderId, RecordError>> {
  return deps.orders.insert(order);
}

// thin shell composes the pieces — easily inspected
export async function handleOrder(
  input: unknown,
  deps: { orders: OrderRepository; mail: MailGateway },
): Promise<Result<{ orderId: OrderId }, HandleOrderError>> {
  const parsed = parseOrderInput(input);
  if (!parsed.ok) return { ok: false, error: { kind: 'parse', detail: parsed.error } };
  const priced = priceOrder(parsed.value.items);
  const recorded = await recordOrder(priced, deps);
  if (!recorded.ok) return { ok: false, error: { kind: 'record', detail: recorded.error } };
  await deps.mail.send(parsed.value.customerEmail, priced.total);
  return { ok: true, value: { orderId: recorded.value } };
}
```

Reference: [https://arxiv.org/html/2602.07882](https://arxiv.org/html/2602.07882), [https://link.springer.com/article/10.1007/s11432-025-4632-8](https://link.springer.com/article/10.1007/s11432-025-4632-8), [https://arxiv.org/abs/2505.23953](https://arxiv.org/abs/2505.23953), [https://arxiv.org/html/2510.26480v1](https://arxiv.org/html/2510.26480v1), [https://arxiv.org/html/2504.15564v1](https://arxiv.org/html/2504.15564v1), [https://arxiv.org/html/2511.04355v1](https://arxiv.org/html/2511.04355v1), [https://dl.acm.org/doi/10.1145/3801158](https://dl.acm.org/doi/10.1145/3801158)

### 4.2 Treat the LLM's Effective Context as a Hard Budget; Optimize Token Density

**Impact: HIGH**

Advertised context windows substantially overstate the working capacity of frontier LLMs on code tasks. **LongCodeBench (arXiv 2505.07897) reports Claude 3.5 Sonnet drops from 29% to 3% on LongSWE-Bench as context grows from 32K to 256K tokens; Gemini 2 Flash and GPT-4o peak at 32K and degrade thereafter.** Chroma Research's 2025 "Context Rot" study tested 18 frontier models and found a 200K-window model can show significant degradation by 50K tokens; all 18 worsened at every length increment. "Lost in the Middle" (Liu et al., TACL 2024) reports >30% accuracy loss when relevant facts move from the start/end to the middle of long context. The corollary: every byte of code visible to the agent competes for finite attention. "The Hidden Cost of Readability" (arXiv 2508.13666, 2025) shows stripping formatting yields **24.5% average input-token reduction with negligible Pass@1 impact** (Java sees 34.9% reduction). "ShortenDoc" (ACM TOSEM 2025) achieves **25–40% docstring token reduction** while preserving generation quality. "Testing the Effect of Code Documentation on LLMs" (NAACL Findings 2024) finds redundant comments do not increase LLM understanding; "What's Wrong With Your Code" reports LLMs increase comment density when *uncertain about correctness* — comment volume is a signal of unease, not quality. Practical rules: keep working sets under ~32K tokens of code; strip redundant whitespace on critical retrieval paths; compress docstrings to information content; place load-bearing facts at file-start and file-end, never in the middle.

**Incorrect: verbose formatting, redundant docstrings, key facts buried in the middle**

```ts
/**
 * This function takes an array of billing events
 * and returns a summary object.
 *
 * It iterates over the events and adds up the amounts
 * to compute the total.
 *
 * @param events - the events
 * @param events.amountMinorUnits - the amount
 * @returns the summary object
 */
export function summarize(

  events:   readonly  BillingEvent[],

): BillingSummary {

  // initialize the total
  let   total = 0;

  // loop through the events
  for (   const  event   of    events    ) {

    total  +=  event.amountMinorUnits;

  }

  // return the summary
  return    {  totalMinorUnits:  total,  entryCount:   events.length   };
}
```

**Correct: dense formatting; docstring carries information not derivable from the signature; key facts at top**

```ts
/** Sum minor-unit amounts and count entries. Amounts must already be in same currency (ADR-0014). */
export function summarize(events: readonly BillingEvent[]): BillingSummary {
  const totalMinorUnits = events.reduce((sum, event) => sum + event.amountMinorUnits, 0);
  return { totalMinorUnits, entryCount: events.length };
}
```

Reference: [https://arxiv.org/html/2505.07897v3](https://arxiv.org/html/2505.07897v3), [https://www.trychroma.com/research/context-rot](https://www.trychroma.com/research/context-rot), [https://aclanthology.org/2024.tacl-1.9/](https://aclanthology.org/2024.tacl-1.9/), [https://arxiv.org/abs/2406.11612](https://arxiv.org/abs/2406.11612), [https://arxiv.org/abs/2509.09614](https://arxiv.org/abs/2509.09614), [https://arxiv.org/abs/2510.05381](https://arxiv.org/abs/2510.05381), [https://arxiv.org/abs/2508.13666](https://arxiv.org/abs/2508.13666), [https://dl.acm.org/doi/10.1145/3735636](https://dl.acm.org/doi/10.1145/3735636), [https://aclanthology.org/2024.findings-naacl.66.pdf](https://aclanthology.org/2024.findings-naacl.66.pdf)

---

## 5. Composition — Front-Load Semantics in Every File

**Impact: HIGH**

LLM comprehension is empirically stronger at the start of files than the end, and explanatory comments measurably lift downstream task performance because they live in-distribution with pretraining corpora. File-level intent at the top, public types and exports before implementation, and WHY-not-WHAT comments are the highest-signal investments per token. They also pre-load the relevant region of vector space before the model reads the implementation.

### 5.1 Front-Load Every File With a Module-Intent Header and Public Surface

**Impact: HIGH**

LLM comprehension is empirically stronger at the start of files than at the end. Zhang et al. (2025), analyzing 575K debugging tasks across nine LLMs, report that comprehension degrades as a function of file position — tokenization biases attention toward early lexical context. The implication: short files with module-intent comments at the top, public types and exports immediately after, and implementation last form the highest-signal layout. "Code Needs Comments" (ACL 2024 Findings) corroborates from the training side — comment density during pretraining significantly affects downstream task performance, so explanatory headers live in-distribution and pre-load the relevant region of vector space before the model reads the implementation. SWE-Bench Pro's failure analysis identifies misunderstood specifications and misleading signatures as a top failure cause; a file header that states the module's purpose and contract collapses that ambiguity at first read.

**Incorrect: no header, implementation buried under helpers, public surface unmarked**

```ts
function helper1(x: number) { return x * 2; }
function helper2(x: number) { return x + 1; }

export function compute(a: number, b: number) {
  return helper1(a) + helper2(b);
}

function helper3(s: string) { return s.trim(); }
export function format(s: string) { return helper3(s); }
```

**Correct: intent header, then public surface, then private implementation**

```ts
/**
 * billing-summary
 *
 * Computes per-customer billing summaries from raw ledger entries.
 *
 * Inputs:  LedgerEntry[] (immutable, typically from BillingRepository.findByCustomer)
 * Outputs: BillingSummary (used by /billing/summary API + monthly statement job)
 * Invariants: amounts are minor units (integer); currency conversion is out of scope here.
 */

// ── Public surface ─────────────────────────────────────────────────────────

export interface BillingSummary {
  readonly legalPartyId: LegalPartyId;
  readonly totalMinorUnits: number;
  readonly entryCount: number;
}

export function summarizeBilling(
  legalPartyId: LegalPartyId,
  entries: readonly LedgerEntry[]
): BillingSummary {
  return {
    legalPartyId,
    totalMinorUnits: sumMinorUnits(entries),
    entryCount: entries.length,
  };
}

// ── Private implementation ─────────────────────────────────────────────────

function sumMinorUnits(entries: readonly LedgerEntry[]): number {
  return entries.reduce((total, entry) => total + entry.amountMinorUnits, 0);
}
```

Reference: [https://arxiv.org/abs/2504.04372](https://arxiv.org/abs/2504.04372), [https://aclanthology.org/2024.findings-acl.809.pdf](https://aclanthology.org/2024.findings-acl.809.pdf), [https://arxiv.org/abs/2509.16941](https://arxiv.org/abs/2509.16941), [https://arxiv.org/abs/2411.01414](https://arxiv.org/abs/2411.01414)

### 5.2 Write Comments That Explain WHY, Not WHAT — Especially at Non-Obvious Constraints

**Impact: HIGH**

Code Needs Comments (ACL 2024 Findings) reports that comment density meaningfully affects downstream LLM task performance, but only when comments add information not derivable from the code itself. WHAT-comments duplicate the implementation and inflate context cost without lifting accuracy; WHY-comments encode hidden constraints, ordering invariants, performance budgets, security boundaries, and workaround rationale — information the agent cannot recover from the AST. The "Hidden Cost of Readability" study (arXiv 2508.13666, 2025) shows that comment volume costs tokens model-dependently — Gemini-1.5 degrades 3-4% with aggressive formatting, while Claude and GPT-4o tolerate dense formatting — so the bias should be toward few, dense, high-signal WHY-comments rather than blanket prose. Restrict comments to: invariants the type system cannot express, rationale for non-obvious choices, references to external constraints (specs, tickets, incidents), and explicit warnings.

**Incorrect: comments restate the code; no constraint encoded**

```ts
// Increment count by 1
count += 1;

// Loop through users
for (const user of users) {
  // Set active to true
  user.active = true;
}

// Return the result
return result;
```

**Correct: comments encode invariants and rationale the type system can't**

```ts
// Ledger amounts are stored in minor units (cents) to avoid float drift across
// currency conversions; do NOT introduce decimal types here without coordinating
// with the reconciliation service (see ADR-0014).
const totalMinorUnits = entries.reduce((sum, entry) => sum + entry.amountMinorUnits, 0);

// Process newest-first: the deduplication step downstream assumes entries are
// in non-increasing occurredAt order so duplicates collapse onto the newest.
const ordered = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

// Hash the email lowercased + trimmed: required by RFC 5321 §2.4 for case-fold
// equivalence; tests/identity.spec.ts pins the expected hashes.
const emailHash = sha256(email.trim().toLowerCase());
```

Reference: [https://aclanthology.org/2024.findings-acl.809.pdf](https://aclanthology.org/2024.findings-acl.809.pdf), [https://arxiv.org/abs/2508.13666](https://arxiv.org/abs/2508.13666), [https://arxiv.org/abs/2504.04372](https://arxiv.org/abs/2504.04372), [https://arxiv.org/abs/2407.03611](https://arxiv.org/abs/2407.03611)

---

## 6. Descriptors — The Architectural Map an Agent Reads First

**Impact: HIGH**

Formal architecture descriptors reduce agent navigation steps by 33–44 percent and behavioral variance by 52 percent in field studies, regardless of file format. AGENTS.md and CLAUDE.md function as the orientation header for the entire repository, but single-file manifests stop scaling at roughly 10k lines — past that point, descriptors must tier (root contract, per-module specs, decision records). Without an explicit map, prompt wording silently fixes architecture ("vibe architecting") and the resulting decisions are unreviewable.

### 6.1 Maintain a Tiered AGENTS.md Map — Root Contract, Per-Module Specs, Sub-Agent Definitions

**Impact: HIGH**

Formal architecture descriptors are the single highest-leverage navigation aid for coding agents. A 2026 field study of 7,012 Claude Code sessions reports that structured descriptors (module boundaries, symbol signatures, constraints, data flows) cut agent navigation steps by 33–44 percent (Wilcoxon p=0.009, Cohen's d=0.92) and reduce behavioral variance by 52 percent — and the file format (S-expression, JSON, YAML, Markdown) is statistically irrelevant; what matters is the *presence* of a formal map. AGENTS.md (Linux Foundation, 2025) is the vendor-neutral standard backed by OpenAI Codex, Cursor, Amp, Jules, and Factory. The "Codified Context" study (arXiv 2602.20478) validates on a 108k-LOC C# system across 283 sessions that single-file manifests stop scaling at roughly 10k lines — past that point the descriptor must tier into a root contract, per-module specs, and sub-agent definitions. The empirical analysis of 328 public CLAUDE.md files (arXiv 2511.09268, Nov 2025) catalogs which concerns developers encode: project overview, development guidelines, architectural constraints, tool policies — making this set the de facto ontology entry point.

**Incorrect: no root descriptor, or one monolithic README; agent must reconstruct architecture from filenames alone**

```typescript
repo/
  README.md   # 80 lines, mostly install instructions
  src/
  tests/
```

**Correct: tiered descriptor — root contract, module specs, sub-agent definitions**

```typescript
repo/
  AGENTS.md                # root contract: build/test/conventions/architecture overview
  .claude/
    agents/
      reviewer.md          # sub-agent for PR review
      refactor.md          # sub-agent for refactoring tasks
  docs/
    decisions/
      0001-typescript-strict.md
      0014-ledger-minor-units.md
  src/
    domain/
      legal-party/
        AGENTS.md          # module spec: invariants, public API, tests, owners
      billing-event/
        AGENTS.md
    services/
      billing/
        AGENTS.md
```

`AGENTS.md` at the repository root must minimally cover: project intent, build command, test command, naming conventions, type strictness, where ADRs live, and where to look first when modifying each major concern. Per-module `AGENTS.md` files cover: invariants, public surface, tests, and the upstream/downstream modules in the dependency graph.

Reference: [https://arxiv.org/abs/2604.13108](https://arxiv.org/abs/2604.13108), [https://arxiv.org/abs/2602.20478](https://arxiv.org/abs/2602.20478), [https://arxiv.org/abs/2511.09268](https://arxiv.org/abs/2511.09268), [https://agents.md/](https://agents.md/), [https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), [https://www.anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### 6.2 Record Every Non-Obvious Design Decision as an ADR

**Impact: HIGH**

"Architecture Without Architects" (arXiv 2604.04990, 2026) coins "vibe architecting" — the empirical finding that the same prompt produces systems ranging from 141 to 827 LOC and 2 to 6 files. The paper identifies five mechanisms and six coupling patterns by which prompt wording silently fixes architecture without explicit decision, and proposes ADRs extracted from agent reasoning traces as the corrective. Without ADRs, an agent reading the repo cannot distinguish a deliberate constraint ("ledger amounts are minor units because of float drift") from an accidental convention ("the first author happened to write it that way") — and it will rewrite the deliberate constraint as cheerfully as the accidental one. ADRs encode the implicit ontology that the code alone cannot recover, and they live alongside the code so the agent loads them with the relevant module.

**Incorrect: a load-bearing decision is invisible — the next agent breaks it**

```ts
// in src/services/billing/billing.service.ts
// amounts stored as bigint; no rationale anywhere in the repo
async function recordPayment(amountMinorUnits: bigint) { ... }
```

**Correct: a small ADR encodes the rationale, the alternatives considered, and the consequences**

```typescript
docs/decisions/0014-ledger-amounts-as-minor-units.md
─────────────────────────────────────────────────────
# ADR-0014: Ledger amounts stored as minor units (bigint)

Status: accepted (2026-02-11)
Supersedes: —
Superseded by: —

## Context
Cross-currency reconciliation in 2025 surfaced 0.3% balance drift attributable
to float arithmetic in invoice→ledger conversion. The drift was eventually
traced to repeated USD↔EUR conversions using IEEE-754 doubles.

## Decision
All ledger amounts are stored as `bigint` minor units (cents).
Currency conversion is the sole responsibility of the reconciliation service.
Domain types brand minor-unit amounts so accidental mixing with decimals
is a compile-time error.

## Alternatives considered
- Decimal128 via decimal.js: rejected because (a) serialization complexity at
  the API boundary, (b) reconciliation team already standardized on integer
  minor units in their pipeline.
- BigDecimal at the API boundary, double internally: rejected — the drift
  comes from internal operations, not from serialization.

## Consequences
- Every new amount field MUST use the AmountMinorUnits branded type.
- The reconciliation service is the only component allowed to apply rates.
- See src/domain/ledger/AGENTS.md for the public surface that enforces this.
```

Reference: [https://arxiv.org/abs/2604.04990](https://arxiv.org/abs/2604.04990), [https://arxiv.org/abs/2602.20478](https://arxiv.org/abs/2602.20478), [https://arxiv.org/abs/2511.09268](https://arxiv.org/abs/2511.09268), [https://arxiv.org/abs/2411.01414](https://arxiv.org/abs/2411.01414), [https://agents.md/](https://agents.md/)

---

## 7. Monorepo Architecture — Workspaces, Boundaries, and Affected Graphs

**Impact: HIGH**

Monorepos compound every other rule in this skill: a well-structured workspace gives agents one coherent vector-space to navigate, while a poorly-structured one fragments context across implicit boundaries the agent cannot see. Industry evidence at scale is unambiguous — Stripe's autonomous agents ship roughly 1,300 PRs per week into a hundreds-of-millions-of-lines monorepo only because rules are scoped per-subdirectory, not global; Cursor's auto-index hard-caps at 50,000 files; AGENTS.md spec mandates nearest-wins precedence. Tag-based package boundaries (Nx, Packwerk, Spring Modulith), affected-graph build systems (Bazel, Buck2, Turborepo, Nx), and tiered per-package descriptors are the three mechanical levers that keep the monorepo legible as it grows.

### 7.1 Enforce Tag-Based Package Boundaries So Workspaces Form a Layered Dependency Graph

**Impact: HIGH**

A monorepo without enforced inter-package boundaries is a single giant heap that defeats the purpose of having packages at all. Nx's `@nx/enforce-module-boundaries` ESLint rule (the canonical specification) uses tag pairs — *scope* (which domain the package belongs to) and *type* (which architectural layer) — to express rules like "a feature can depend on a lib but not vice versa," or "the api scope may not depend on the marketing scope." Shopify's Packwerk does the equivalent for Ruby monoliths via static constant resolution, with privacy and dependency rules per "pack"; Spring Modulith plus ArchUnit-backed fitness functions provide the JVM equivalent. The empirical case for these is the same as for hexagonal direction generally: the 0%-vs-80% violation gap reported in arXiv 2512.04273 when architecture is enforced versus described. For agent comprehension, tag-based rules give the LLM a typed dependency graph at the workspace level — an extra layer of orientation above the file-level import graph — and they let cross-package boundaries be enforced *mechanically* by CI, not by reviewer attention. The 2025–2026 Nx work on AI agent skills and Datadog's "Steering AI Agents in Monorepos with AGENTS.md" both lean on the assumption that workspace boundaries are well-defined enough to scope per-package conventions; this rule is what makes that assumption hold.

**Incorrect: workspace with packages but no boundary rules — every package can import every other**

```jsonc
// nx.json — no targetDefaults for module boundaries
{
  "namedInputs": { "default": ["{projectRoot}/**/*"] }
}

// any project can import any other; the dependency graph is unbounded
// packages/marketing-site/app/page.tsx
import { internalPaymentToken } from '../../../packages/payments-service/src/internal';
```

**Correct: project.json tags + ESLint rule enforce a layered, scoped graph**

```jsonc
// packages/domain-billing/project.json
{ "name": "domain-billing", "tags": ["scope:billing", "type:domain"] }

// packages/feature-billing-summary/project.json
{ "name": "feature-billing-summary", "tags": ["scope:billing", "type:feature"] }

// packages/marketing-site/project.json
{ "name": "marketing-site", "tags": ["scope:marketing", "type:app"] }

// .eslintrc.json  (or nx.json depConstraints in newer Nx)
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        { "sourceTag": "scope:billing",   "onlyDependOnLibsWithTags": ["scope:billing", "scope:shared"] },
        { "sourceTag": "scope:marketing", "onlyDependOnLibsWithTags": ["scope:marketing", "scope:shared"] },
        { "sourceTag": "type:app",     "onlyDependOnLibsWithTags": ["type:feature", "type:lib", "type:domain"] },
        { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:lib", "type:domain"] },
        { "sourceTag": "type:lib",     "onlyDependOnLibsWithTags": ["type:lib", "type:domain"] },
        { "sourceTag": "type:domain",  "onlyDependOnLibsWithTags": ["type:domain"] }
      ]
    }]
  }
}
```

Reference: [https://nx.dev/features/enforce-module-boundaries](https://nx.dev/features/enforce-module-boundaries), [https://nx.dev/concepts/decisions/integrated-vs-package-based](https://nx.dev/concepts/decisions/integrated-vs-package-based), [https://shopify.engineering/enforcing-modularity-rails-apps-packwerk](https://shopify.engineering/enforcing-modularity-rails-apps-packwerk), [https://shopify.engineering/a-packwerk-retrospective](https://shopify.engineering/a-packwerk-retrospective), [https://docs.spring.io/spring-modulith/reference/](https://docs.spring.io/spring-modulith/reference/), [https://medium.com/@joakimtengstrand/the-polylith-architecture-1eec55c5ebce](https://medium.com/@joakimtengstrand/the-polylith-architecture-1eec55c5ebce), [https://arxiv.org/pdf/2512.04273](https://arxiv.org/pdf/2512.04273)

### 7.2 Expose the Affected/Build Graph as the Agent's Primary Navigation Primitive

**Impact: HIGH**

Modern monorepo build systems — Bazel, Buck2, Turborepo, Nx, moon — all compute a *project graph* and an *affected set* given a changed file: a precise, machine-readable answer to "what depends on this, and what tests need to run?" Surfacing that graph to the agent is empirically the highest-leverage retrieval tool a monorepo can offer. **Sourcegraph's CodeScaleBench (2025) reports file recall rises from 0.127 to 0.277 and Precision@5 from 0.140 to 0.478 when agents call workspace-aware MCP tools instead of grep-and-pray retrieval — across enterprise-scale codebases (≥1M LOC, multi-language, multi-repo).** Stripe's Minions (2025) ship ~1,300 autonomous PRs per week into a hundreds-of-millions-of-lines monorepo specifically because the agent is bootstrapped with deterministic pre-hydration tool calls — including affected-graph queries — before the LLM loop ever starts. Nx's published AI agent skills (`nx-workspace`, `nx-run-tasks`, plus self-healing CI via MCP) make this pattern explicit; Turborepo's AI guide does the same for pnpm-workspace monorepos; the `bazel-mcp-server` exposes `bazel query` to agents. The corollary for any agent-tractable monorepo: package the affected-graph and the workspace-graph as agent-callable tools (MCP, CLI, or both), and instruct AGENTS.md / CLAUDE.md to call them before opening files.

**Incorrect: agent reaches for grep across the whole monorepo because no graph tool is exposed**

```bash
# agent's tool inventory: just `bash`
$ grep -r "LegalPartyId" .
# scans 200,000 files; returns 12,000 matches; agent dumps half into context
```

**Correct: workspace exposes the project graph and affected set as agent tools**

```jsonc
// AGENTS.md at the repository root (excerpt)
// Tools you SHOULD use before reading files:
//   - `pnpm nx affected:graph --base=origin/main`   — scope of impacted packages
//   - `pnpm nx graph`                                — full workspace graph
//   - Bazel: `bazel query "rdeps(//..., <target>)"`  — reverse dependencies
// Tools you should NOT use for navigation:
//   - `grep -r` across the workspace (use the project graph; it is faster and precise)
```

Reference: [https://nx.dev/blog/nx-ai-agent-skills](https://nx.dev/blog/nx-ai-agent-skills), [https://nx.dev/docs/features/enhance-ai](https://nx.dev/docs/features/enhance-ai), [https://turborepo.dev/docs/guides/ai](https://turborepo.dev/docs/guides/ai), [https://bazel.build/](https://bazel.build/), [https://engineering.fb.com/2023/04/06/open-source/buck2-open-source-large-scale-build-system/](https://engineering.fb.com/2023/04/06/open-source/buck2-open-source-large-scale-build-system/), [https://sourcegraph.com/blog/codescalebench-testing-coding-agents-on-large-codebases-and-multi-repo-software-engineering-tasks](https://sourcegraph.com/blog/codescalebench-testing-coding-agents-on-large-codebases-and-multi-repo-software-engineering-tasks), [https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents), [https://stripe.dev/blog/selective-test-execution-at-stripe-fast-ci-for-a-50m-line-ruby-monorepo](https://stripe.dev/blog/selective-test-execution-at-stripe-fast-ci-for-a-50m-line-ruby-monorepo), [https://abseil.io/resources/swe-book/html/ch22.html](https://abseil.io/resources/swe-book/html/ch22.html), [https://aclanthology.org/2025.findings-acl.373/](https://aclanthology.org/2025.findings-acl.373/)

### 7.3 Place AGENTS.md at Every Package Root; Nearest-File-Wins as Default

**Impact: HIGH**

A monolithic root-level AGENTS.md stops scaling at roughly 10,000 lines of code — the empirical finding from "Codified Context" (arXiv 2602.20478, 2026), validated on a 108k-LOC system across 283 sessions. In a real monorepo (50–500 packages, hundreds of thousands of files), a single root descriptor is not just inadequate, it is *misleading*: the conventions of `packages/payments-service/` are inevitably different from `packages/marketing-site/`. The AGENTS.md specification (Agentic AI Foundation, 2025) defines the resolution rule cleanly: **the AGENTS.md nearest to the edited file wins** over the root file, with explicit chat prompts overriding both. Datadog's frontend team published the canonical industry post on this pattern ("Steering AI Agents in Monorepos with AGENTS.md") with per-package files for each scope. Stripe's Minions write-up (2025) is even more direct — at hundreds-of-millions-of-lines scale, **agent rules are conditionally applied per subdirectory because a single global rule file would be useless at their scale**. Anthropic's own enterprise guidance for Claude Code recommends the same hierarchy. The corollary: every package root in a monorepo should carry a focused AGENTS.md/CLAUDE.md that lists its invariants, public surface, tests, allowed upstream deps, and forbidden patterns. The root descriptor documents workspace-wide conventions and points to the per-package files.

**Incorrect: single 800-line root AGENTS.md tries to cover everything; per-package conventions vanish**

```typescript
repo/
  AGENTS.md     # 800 lines covering payments, marketing, mobile, infra, all in one
  packages/
    payments-service/
      src/
      tests/
    marketing-site/
      src/
    mobile-app/
      src/
```

**Correct: root descriptor + per-package descriptors; nearest-wins resolution**

```md
<!-- repo/packages/payments-service/AGENTS.md (per-package) -->
# AGENTS.md — payments-service

## Intent
Owns billing, ledger writes, and reconciliation.

## Invariants
- All amounts are bigint minor units (ADR-0014). NEVER introduce floats.
- The ledger is append-only; updates use compensating entries.

## Public surface
- Exported from `src/index.ts`. Anything not re-exported is internal.

## Allowed dependencies
- May depend on: `@workspace/domain-billing`, `@workspace/shared-types`.
- May NOT depend on: `marketing-site`, `mobile-app`, anything in `apps/`.

## Tests
- `pnpm nx test payments-service` (unit)
- `pnpm nx e2e payments-service-e2e` (integration; requires devbox)
```

Reference: [https://agents.md/](https://agents.md/), [https://dev.to/datadog-frontend-dev/steering-ai-agents-in-monorepos-with-agentsmd-13g0](https://dev.to/datadog-frontend-dev/steering-ai-agents-in-monorepos-with-agentsmd-13g0), [https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents), [https://arxiv.org/abs/2602.20478](https://arxiv.org/abs/2602.20478), [https://arxiv.org/abs/2511.09268](https://arxiv.org/abs/2511.09268), [https://www.anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices), [https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf)

---

## 8. Gates — Mechanical Enforcement of the Ontology

**Impact: CRITICAL**

Every property the prior sections prescribe must be mechanically enforced at write-time and merge-time, or it drifts. Type-checking and linting catch surface defects; structured-output validation catches LLM-produced contract violations; strong test oracles catch behavioral shortcuts (a third of "successful" agent patches on weak oracles reflect inadequate tests, not correct fixes); agent-comprehension re-derivation tests catch semantic drift between the code's intent and its current shape. Gates are the only mechanism that keeps the ontology hardened under agent authorship.

### 8.1 Gate Every Commit With Strict Type-Checking and Naming/Style Lint

**Impact: CRITICAL**

The properties prescribed in the prior sections — descriptive names, canonical terminology, strong types, acyclic imports, explicit module surfaces — drift under agent authorship unless mechanically enforced at write-time and merge-time. Liu et al.'s coding-style consistency study (2024) reports that agents inherit and amplify style priors from surrounding code; any unenforced inconsistency trains the next edit to be more inconsistent. Mündler et al.'s PLDI 2025 result that type-constrained generation reduces compile errors by >50% only holds when the type checker is actually run — and not run after the fact, when the agent has already moved on. Strict type-checking, naming/style lint, and import-cycle detection should be a pre-commit hook AND a CI gate, configured to FAIL the build rather than warn. Warnings are ignored; broken builds are fixed.

**Incorrect: no gates; the next agent edit silently introduces `any`, cycles, and ad-hoc names**

```json
// tsconfig.json — permissive
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}

// package.json — no checks gated
{
  "scripts": {
    "build": "tsc",
    "test": "vitest"
  }
}
```

**Correct: gates enforce the ontology before code lands**

```json
// tsconfig.json — strict + module-cycle detection
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true
  }
}

// package.json — pre-commit + CI gates
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "lint:cycles": "madge --circular --extensions ts src/",
    "lint:names": "eslint . --rule '@typescript-eslint/naming-convention: error'",
    "verify": "pnpm typecheck && pnpm lint && pnpm lint:cycles && pnpm test"
  },
  "lint-staged": {
    "*.ts": ["pnpm typecheck", "pnpm lint --fix", "pnpm lint:cycles"]
  }
}

// .github/workflows/ci.yml — same checks, failing-mode
// - run: pnpm verify
```

Reference: [https://arxiv.org/abs/2504.09246](https://arxiv.org/abs/2504.09246), [https://arxiv.org/abs/2407.00456](https://arxiv.org/abs/2407.00456), [https://arxiv.org/abs/2605.02741](https://arxiv.org/abs/2605.02741), [https://arxiv.org/abs/2411.01414](https://arxiv.org/abs/2411.01414), [https://arxiv.org/abs/2411.02320](https://arxiv.org/abs/2411.02320)

### 8.2 Test With Strong Oracles and Add Agent-Comprehension Re-Derivation Checks

**Impact: CRITICAL**

Sparse or shallow test oracles do not reward correct fixes — they reward shortcut solutions that pass the visible assertion. UTBoost (ACL 2025) augmented SWE-Bench tests with stronger oracles and reports that **40.9% of SWE-Bench Lite rankings shifted, 32.67% of "successful" patches involved solution leakage, and 31.08% passed only because the tests were inadequate**. Zhang et al. (arXiv 2504.04372, 2025) report that across 575K debugging tasks, LLMs fail to re-detect the same bug after a semantic-preserving mutation in 81% of cases — direct evidence that "passing the test" and "understanding the code" are uncorrelated. Two consequences for gates: (1) tests must include negative cases, boundary cases, and at least one mutation-style assertion per public API; (2) the release gate should include an *agent-comprehension test* — an agent reads only the public surface and ADRs and must re-derive a free-form summary; if the summary diverges materially from the intent encoded in the file headers and ADRs, the change is rejected.

**Incorrect: one assertion per test; passes trivially with `return null`**

```ts
import { summarizeBilling } from './billing-summary';

test('summarizeBilling returns something', () => {
  const result = summarizeBilling('party-1' as any, []);
  expect(result).toBeDefined();
});
```

**Correct: strong oracles + agent-comprehension check**

```ts
import { summarizeBilling, type BillingSummary } from './billing-summary';
import { runAgentComprehensionCheck } from '@/tools/comprehension';

describe('summarizeBilling', () => {
  test('empty entries → zero total, zero count, same legalPartyId', () => {
    const r = summarizeBilling(legalPartyId('party-1'), []);
    expect(r).toEqual<BillingSummary>({
      legalPartyId: legalPartyId('party-1'),
      totalMinorUnits: 0,
      entryCount: 0,
    });
  });

  test('multiple entries → exact sum and count', () => {
    const r = summarizeBilling(legalPartyId('party-2'), [
      entry({ amountMinorUnits: 100 }),
      entry({ amountMinorUnits: 250 }),
      entry({ amountMinorUnits: 75 }),
    ]);
    expect(r.totalMinorUnits).toBe(425);
    expect(r.entryCount).toBe(3);
  });

  test('mutation: swapping reducer to subtraction must fail at least one test',
    async () => {
      const verdict = await runMutationProbe('subtract', { module: 'billing-summary' });
      expect(verdict.killedByTests).toBe(true);
    });
});

// Release-gate (run in CI on the public surface only):
test('agent re-derives the documented intent', async () => {
  const summary = await runAgentComprehensionCheck({
    publicSurfaceFiles: ['src/services/billing/index.ts'],
    intentArtifact: 'src/services/billing/AGENTS.md',
  });
  expect(summary.intentDivergence).toBeLessThan(0.15);
});
```

Reference: [https://aclanthology.org/2025.acl-long.189.pdf](https://aclanthology.org/2025.acl-long.189.pdf), [https://arxiv.org/abs/2504.04372](https://arxiv.org/abs/2504.04372), [https://arxiv.org/abs/2310.06770](https://arxiv.org/abs/2310.06770), [https://openai.com/index/introducing-swe-bench-verified/](https://openai.com/index/introducing-swe-bench-verified/), [https://arxiv.org/abs/2509.16941](https://arxiv.org/abs/2509.16941), [https://arxiv.org/abs/2506.12286](https://arxiv.org/abs/2506.12286)

---

## References

1. [https://arxiv.org/abs/2310.06770](https://arxiv.org/abs/2310.06770)
2. [https://arxiv.org/abs/2405.15793](https://arxiv.org/abs/2405.15793)
3. [https://arxiv.org/abs/2509.16941](https://arxiv.org/abs/2509.16941)
4. [https://arxiv.org/abs/2410.14684](https://arxiv.org/abs/2410.14684)
5. [https://arxiv.org/abs/2505.16901](https://arxiv.org/abs/2505.16901)
6. [https://aclanthology.org/2025.naacl-long.7/](https://aclanthology.org/2025.naacl-long.7/)
7. [https://arxiv.org/abs/2406.07003](https://arxiv.org/abs/2406.07003)
8. [https://arxiv.org/abs/2309.12499](https://arxiv.org/abs/2309.12499)
9. [https://arxiv.org/abs/2407.01489](https://arxiv.org/abs/2407.01489)
10. [https://arxiv.org/abs/2307.12488](https://arxiv.org/abs/2307.12488)
11. [https://arxiv.org/abs/2510.03178](https://arxiv.org/abs/2510.03178)
12. [https://arxiv.org/abs/2504.04372](https://arxiv.org/abs/2504.04372)
13. [https://arxiv.org/abs/2504.09246](https://arxiv.org/abs/2504.09246)
14. [https://arxiv.org/abs/2409.00921](https://arxiv.org/abs/2409.00921)
15. [https://arxiv.org/abs/2307.09702](https://arxiv.org/abs/2307.09702)
16. [https://arxiv.org/abs/2411.15100](https://arxiv.org/abs/2411.15100)
17. [https://arxiv.org/abs/2501.10868](https://arxiv.org/abs/2501.10868)
18. [https://aclanthology.org/2024.findings-acl.809.pdf](https://aclanthology.org/2024.findings-acl.809.pdf)
19. [https://arxiv.org/abs/2604.13108](https://arxiv.org/abs/2604.13108)
20. [https://arxiv.org/abs/2602.20478](https://arxiv.org/abs/2602.20478)
21. [https://arxiv.org/abs/2511.09268](https://arxiv.org/abs/2511.09268)
22. [https://agents.md/](https://agents.md/)
23. [https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
24. [https://www.anthropic.com/engineering/claude-code-best-practices](https://www.anthropic.com/engineering/claude-code-best-practices)
25. [https://aclanthology.org/2025.acl-long.189.pdf](https://aclanthology.org/2025.acl-long.189.pdf)
26. [https://aclanthology.org/2025.findings-acl.373.pdf](https://aclanthology.org/2025.findings-acl.373.pdf)
27. [https://arxiv.org/abs/2411.01414](https://arxiv.org/abs/2411.01414)
28. [https://arxiv.org/abs/2306.03091](https://arxiv.org/abs/2306.03091)
29. [https://arxiv.org/abs/2406.11612](https://arxiv.org/abs/2406.11612)
30. [https://arxiv.org/abs/2305.15334](https://arxiv.org/abs/2305.15334)
31. [https://arxiv.org/abs/2307.16789](https://arxiv.org/abs/2307.16789)
32. [https://modelcontextprotocol.io/specification/2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25)
33. [https://arxiv.org/abs/2306.08302](https://arxiv.org/abs/2306.08302)

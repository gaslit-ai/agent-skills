---
title: Design Narrow, Deep Public API Surfaces; Curate Re-Exports Deliberately
impact: CRITICAL
tags: types, api-surface, public-api, ousterhout, barrels, retrieval-index
---

## Design Narrow, Deep Public API Surfaces; Curate Re-Exports Deliberately

**Impact: CRITICAL**

The public surface of every module is simultaneously a runtime contract and the agent's retrieval index — what the agent searches against, scrolls through, and grounds tool-calls in. Ousterhout's "deep modules, narrow interfaces" doctrine (maximize functionality / interface complexity) is the structural primitive; Bloch's "easy to use, hard to misuse" is the agent-tractable restatement. BigCodeBench (ICLR 2025) reports that the best LLMs score ~60% vs 97% human, with failures concentrated in *compositional* API use — getting the right combination of functions called with the right outputs threaded. MCP-Bench (NeurIPS 2025) and the "MCP Tool Descriptions Are Smelly!" study (arXiv 2602.14878) find 97.1% of public MCP tool descriptions contain quality smells and 56% fail to state purpose clearly; description-only refinements drove SOTA SWE-bench Verified gains. The corollary for an `index.ts` / `mod.rs` / package surface: re-export the minimum coherent set with intentional, agent-readable naming; bulk barrels that dump everything ("export * from ...") destroy both build performance (Atlassian: 75% faster builds removing barrels) and the agent's signal-to-noise ratio.

**Incorrect (everything exported, no curated surface, ambiguous shapes):**

```ts
// src/services/billing/index.ts — agent has no idea what is "public"
export * from './billing.service';
export * from './billing.repository';
export * from './billing.cache';
export * from './internal/legacy-billing-helpers';
export * from './internal/migration-2024-q3';

// callers see hundreds of symbols; many shouldn't exist outside the module
```

**Correct (curated narrow surface + descriptive doc comments that double as retrieval index):**

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

References:
- [Ousterhout — A Philosophy of Software Design (Modular Design lecture)](https://web.stanford.edu/~ouster/cgi-bin/cs190-spring16/lecture.php?topic=modularDesign)
- [Bloch — How to Design a Good API and Why It Matters (OOPSLA 2006)](https://research.google.com/pubs/archive/32713.pdf)
- [Zhuo et al. — BigCodeBench (ICLR 2025)](https://arxiv.org/abs/2406.15877)
- [Hou et al. — MCP Tool Descriptions Are Smelly! (arXiv 2602.14878)](https://arxiv.org/abs/2602.14878)
- [Anthropic — Writing Effective Tools for AI Agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Zhou et al. — DocPrompting (ICLR 2023 Spotlight)](https://arxiv.org/abs/2207.05987)
- [Atlassian — 75% Faster Builds by Removing Barrel Files](https://www.atlassian.com/blog/atlassian-engineering/faster-builds-when-removing-barrel-files)

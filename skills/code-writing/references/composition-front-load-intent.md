---
title: Front-Load Every File With a Module-Intent Header and Public Surface
impact: HIGH
tags: composition, file-header, intent, layout, comprehension-bias
---

## Front-Load Every File With a Module-Intent Header and Public Surface

**Impact: HIGH**

LLM comprehension is empirically stronger at the start of files than at the end. Zhang et al. (2025), analyzing 575K debugging tasks across nine LLMs, report that comprehension degrades as a function of file position — tokenization biases attention toward early lexical context. The implication: short files with module-intent comments at the top, public types and exports immediately after, and implementation last form the highest-signal layout. "Code Needs Comments" (ACL 2024 Findings) corroborates from the training side — comment density during pretraining significantly affects downstream task performance, so explanatory headers live in-distribution and pre-load the relevant region of vector space before the model reads the implementation. SWE-Bench Pro's failure analysis identifies misunderstood specifications and misleading signatures as a top failure cause; a file header that states the module's purpose and contract collapses that ambiguity at first read.

**Incorrect (no header, implementation buried under helpers, public surface unmarked):**

```ts
function helper1(x: number) { return x * 2; }
function helper2(x: number) { return x + 1; }

export function compute(a: number, b: number) {
  return helper1(a) + helper2(b);
}

function helper3(s: string) { return s.trim(); }
export function format(s: string) { return helper3(s); }
```

**Correct (intent header, then public surface, then private implementation):**

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

References:
- [Zhang et al. — How Accurately Do Large Language Models Understand Code?](https://arxiv.org/abs/2504.04372)
- [Yang et al. — Code Needs Comments: Enhancing Code LLMs with Comment Augmentation (ACL 2024 Findings)](https://aclanthology.org/2024.findings-acl.809.pdf)
- [SWE-Bench Pro: Can AI Agents Solve Long-Horizon SE Tasks?](https://arxiv.org/abs/2509.16941)
- [Chen et al. — A Deep Dive Into LLM Code Generation Mistakes](https://arxiv.org/abs/2411.01414)

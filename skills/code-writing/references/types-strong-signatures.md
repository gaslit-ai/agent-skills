---
title: Annotate Every Public Signature With Specific, Non-any Types
impact: CRITICAL
tags: types, signatures, llm-grounding, decode-time-constraints
---

## Annotate Every Public Signature With Specific, Non-any Types

**Impact: CRITICAL**

Type information is the strongest non-natural-language ground truth available to an LLM reasoning about code. Mündler et al.'s PLDI 2025 study on type-constrained code generation reports that enforcing well-typedness at decode time reduces compilation errors by more than 50% and raises functional correctness across HumanEval and MBPP. Blinn et al.'s OOPSLA 2024 study of typed holes shows that type definitions alone — without surrounding code — produce the largest single accuracy gain on the MVUBench completion benchmark, evidence that type signatures densely encode intent. SWE-Bench Pro's failure analysis traces a large class of false negatives to interface mismatches between agent solutions and unit-test expectations: agents fix the wrong shape because the right shape was never typed. `any`, missing return types, and untyped object parameters are not stylistic choices — they erase the orienting signal models depend on.

**Incorrect (signature gives the agent no type-shaped grounding):**

```ts
export function process(data: any, options: any) {
  if (options.mode === 'sum') return data.reduce((a, b) => a + b.amount, 0);
  if (options.mode === 'count') return data.length;
  return null;
}
```

**Correct (discriminated input, explicit return, branded primitives):**

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

References:
- [Mündler et al. — Type-Constrained Code Generation with Language Models (PLDI 2025)](https://arxiv.org/abs/2504.09246)
- [Blinn et al. — Statically Contextualizing LLMs with Typed Holes (OOPSLA 2024)](https://arxiv.org/abs/2409.00921)
- [Wei et al. — TypeT5: Seq2seq Type Inference Using Static Analysis (ICLR 2023)](https://arxiv.org/abs/2303.09564)
- [SWE-Bench Pro: Can AI Agents Solve Long-Horizon Software Engineering Tasks?](https://arxiv.org/abs/2509.16941)
- [Chen et al. — A Deep Dive Into LLM Code Generation Mistakes: What and Why?](https://arxiv.org/abs/2411.01414)

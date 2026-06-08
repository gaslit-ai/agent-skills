---
title: Use Descriptive Identifiers That State Intent, Not Abbreviations or Single Letters
impact: CRITICAL
tags: identifiers, naming, semantics, llm-comprehension
---

## Use Descriptive Identifiers That State Intent, Not Abbreviations or Single Letters

**Impact: CRITICAL**

Identifier obfuscation produces the largest single performance drop of any code transformation studied in LLM comprehension experiments. Gao et al.'s controlled study across multiple LLMs and code-analysis tasks reports that variable renaming degrades performance more than dead-code removal or control-flow scrambling — descriptive names achieve 34.2% exact-match completion versus 16.6% for obfuscated names. The 2025 "When Names Disappear" experiment strips identifiers and shows intent-level comprehension collapses to line-by-line narration while behavior-tracing persists, evidence that names — not control structure — carry the conceptual layer LLMs consume. Empica (2024) corroborates: LLMs trust surface naming over deeper analysis, so misleading names actively poison agent reasoning rather than merely obscuring it.

**Incorrect (single-letter and unsemantic abbreviations — agent must reconstruct intent from usage):**

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

**Correct (identifiers state the intent the LLM should consume directly):**

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

References:
- [Gao et al. — How Does Naming Affect LLMs on Code Analysis Tasks?](https://arxiv.org/abs/2307.12488)
- [When Names Disappear: Revealing What LLMs Actually Understand About Code](https://arxiv.org/abs/2510.03178)
- [Empica — An Empirical Study on Capability of LLMs in Understanding Code Semantics](https://arxiv.org/abs/2407.03611)
- [Zhang et al. — How Accurately Do Large Language Models Understand Code?](https://arxiv.org/abs/2504.04372)
- [Chen et al. — A Deep Dive Into LLM Code Generation Mistakes: What and Why?](https://arxiv.org/abs/2411.01414)

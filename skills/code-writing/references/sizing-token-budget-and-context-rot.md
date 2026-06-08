---
title: Treat the LLM's Effective Context as a Hard Budget; Optimize Token Density
impact: HIGH
tags: sizing, context, token-budget, context-rot, lost-in-the-middle, formatting
---

## Treat the LLM's Effective Context as a Hard Budget; Optimize Token Density

**Impact: HIGH**

Advertised context windows substantially overstate the working capacity of frontier LLMs on code tasks. **LongCodeBench (arXiv 2505.07897) reports Claude 3.5 Sonnet drops from 29% to 3% on LongSWE-Bench as context grows from 32K to 256K tokens; Gemini 2 Flash and GPT-4o peak at 32K and degrade thereafter.** Chroma Research's 2025 "Context Rot" study tested 18 frontier models and found a 200K-window model can show significant degradation by 50K tokens; all 18 worsened at every length increment. "Lost in the Middle" (Liu et al., TACL 2024) reports >30% accuracy loss when relevant facts move from the start/end to the middle of long context. The corollary: every byte of code visible to the agent competes for finite attention. "The Hidden Cost of Readability" (arXiv 2508.13666, 2025) shows stripping formatting yields **24.5% average input-token reduction with negligible Pass@1 impact** (Java sees 34.9% reduction). "ShortenDoc" (ACM TOSEM 2025) achieves **25–40% docstring token reduction** while preserving generation quality. "Testing the Effect of Code Documentation on LLMs" (NAACL Findings 2024) finds redundant comments do not increase LLM understanding; "What's Wrong With Your Code" reports LLMs increase comment density when *uncertain about correctness* — comment volume is a signal of unease, not quality. Practical rules: keep working sets under ~32K tokens of code; strip redundant whitespace on critical retrieval paths; compress docstrings to information content; place load-bearing facts at file-start and file-end, never in the middle.

**Incorrect (verbose formatting, redundant docstrings, key facts buried in the middle):**

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

**Correct (dense formatting; docstring carries information not derivable from the signature; key facts at top):**

```ts
/** Sum minor-unit amounts and count entries. Amounts must already be in same currency (ADR-0014). */
export function summarize(events: readonly BillingEvent[]): BillingSummary {
  const totalMinorUnits = events.reduce((sum, event) => sum + event.amountMinorUnits, 0);
  return { totalMinorUnits, entryCount: events.length };
}
```

References:
- [LongCodeBench: Evaluating Coding LLMs at 1M Context Windows (arXiv 2505.07897)](https://arxiv.org/html/2505.07897v3)
- [Context Rot — Chroma Research (2025)](https://www.trychroma.com/research/context-rot)
- [Lost in the Middle (Liu et al., TACL 2024)](https://aclanthology.org/2024.tacl-1.9/)
- [Long Code Arena (JetBrains 2024)](https://arxiv.org/abs/2406.11612)
- [LoCoBench (arXiv 2509.09614)](https://arxiv.org/abs/2509.09614)
- [Du et al. — Context Length Alone Hurts LLM Performance Despite Perfect Retrieval (EMNLP Findings 2025)](https://arxiv.org/abs/2510.05381)
- [The Hidden Cost of Readability (arXiv 2508.13666)](https://arxiv.org/abs/2508.13666)
- [ShortenDoc — Less Is More: Docstring Compression (ACM TOSEM 2025)](https://dl.acm.org/doi/10.1145/3735636)
- [Testing the Effect of Code Documentation on LLMs (NAACL Findings 2024)](https://aclanthology.org/2024.findings-naacl.66.pdf)

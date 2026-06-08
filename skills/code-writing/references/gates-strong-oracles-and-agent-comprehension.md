---
title: Test With Strong Oracles and Add Agent-Comprehension Re-Derivation Checks
impact: CRITICAL
tags: gates, test-oracles, swe-bench, agent-comprehension, release-gates
---

## Test With Strong Oracles and Add Agent-Comprehension Re-Derivation Checks

**Impact: CRITICAL**

Sparse or shallow test oracles do not reward correct fixes — they reward shortcut solutions that pass the visible assertion. UTBoost (ACL 2025) augmented SWE-Bench tests with stronger oracles and reports that **40.9% of SWE-Bench Lite rankings shifted, 32.67% of "successful" patches involved solution leakage, and 31.08% passed only because the tests were inadequate**. Zhang et al. (arXiv 2504.04372, 2025) report that across 575K debugging tasks, LLMs fail to re-detect the same bug after a semantic-preserving mutation in 81% of cases — direct evidence that "passing the test" and "understanding the code" are uncorrelated. Two consequences for gates: (1) tests must include negative cases, boundary cases, and at least one mutation-style assertion per public API; (2) the release gate should include an *agent-comprehension test* — an agent reads only the public surface and ADRs and must re-derive a free-form summary; if the summary diverges materially from the intent encoded in the file headers and ADRs, the change is rejected.

**Incorrect (one assertion per test; passes trivially with `return null`):**

```ts
import { summarizeBilling } from './billing-summary';

test('summarizeBilling returns something', () => {
  const result = summarizeBilling('party-1' as any, []);
  expect(result).toBeDefined();
});
```

**Correct (strong oracles + agent-comprehension check):**

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

References:
- [UTBoost: Rigorous Evaluation of Coding Agents on SWE-Bench (ACL 2025)](https://aclanthology.org/2025.acl-long.189.pdf)
- [Zhang et al. — How Accurately Do Large Language Models Understand Code?](https://arxiv.org/abs/2504.04372)
- [Jimenez et al. — SWE-bench (ICLR 2024)](https://arxiv.org/abs/2310.06770)
- [SWE-Bench Verified (OpenAI 2024)](https://openai.com/index/introducing-swe-bench-verified/)
- [SWE-Bench Pro: Can AI Agents Solve Long-Horizon SE Tasks?](https://arxiv.org/abs/2509.16941)
- [The SWE-Bench Illusion: When SOTA LLMs Remember Instead of Reason](https://arxiv.org/abs/2506.12286)

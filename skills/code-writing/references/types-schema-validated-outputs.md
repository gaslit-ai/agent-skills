---
title: Define and Schema-Validate Every Structured Output Cross-Boundary
impact: CRITICAL
tags: types, schemas, json-schema, structured-output, mcp, tool-use, decode-time
---

## Define and Schema-Validate Every Structured Output Cross-Boundary

**Impact: CRITICAL**

Schemas are the only contracts that hold mechanically across the LLM/code boundary. Outlines (Willard & Louf 2023) reformulates LLM generation as finite-state transitions indexed against the vocabulary, making schema enforcement essentially free at decode time; XGrammar (Dong et al. 2024) achieves up to 100× speedup and is now the default backend in vLLM, SGLang, and TensorRT-LLM. JSONSchemaBench (Microsoft Research + EPFL 2025) benchmarks 10K real-world JSON Schemas from GitHub, Kubernetes, and API specs across guidance engines, establishing JSON Schema as the canonical inter-system contract. The Model Context Protocol (Anthropic, Nov 2024 — adopted by OpenAI and Google) is the same principle applied to tool surfaces: typed JSON-RPC primitives form the lingua franca agents speak to systems. Cross-boundary data with no schema is data the agent must reconstruct from prose — a guessing problem the literature has shown is brittle and unverifiable.

**Incorrect (unvalidated JSON crosses an LLM boundary — runtime errors and silent contract drift):**

```ts
const response = await llm.complete({
  prompt: 'Extract billing event as JSON',
  text: invoiceText,
});

// trust the model; pray the keys exist
const event = JSON.parse(response.content);
await ledger.recordEvent(event.amount, event.currency, event.customerId);
```

**Correct (schema is the contract; validate at every crossing):**

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

References:
- [Willard & Louf — Efficient Guided Generation for LLMs (Outlines)](https://arxiv.org/abs/2307.09702)
- [Dong et al. — XGrammar: Flexible and Efficient Structured Generation Engine for LLMs](https://arxiv.org/abs/2411.15100)
- [Geng et al. — JSONSchemaBench: A Rigorous Benchmark of Structured Outputs](https://arxiv.org/abs/2501.10868)
- [Zheng et al. — SGLang: Efficient Execution of Structured Language Model Programs (NeurIPS 2024)](https://arxiv.org/abs/2312.07104)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [Patil et al. — Berkeley Function Calling Leaderboard (ICML 2025)](https://openreview.net/forum?id=2GmDdhBdDk)

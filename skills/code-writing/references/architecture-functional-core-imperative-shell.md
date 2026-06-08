---
title: Separate the Functional Core From the Imperative Shell; Push Effects to the Edge
impact: HIGH
tags: architecture, functional-core, effects, purity, testability, result-types
---

## Separate the Functional Core From the Imperative Shell; Push Effects to the Edge

**Impact: HIGH**

Gary Bernhardt's "Functional Core, Imperative Shell" pattern — pure decision logic at the center, all I/O and effects pushed to a thin imperative shell at the edge — was endorsed by Google's official testing blog in October 2025, a strong signal it has gone mainstream at scale. The "Constraint Decay" study (arXiv 2605.06445, 2025) shows agents producing functional code degrade non-linearly as architecture, DB, and ORM constraints stack — implying the most reliable agent-authored code is the part that has no constraints to violate (pure functions on plain data). The 14.ai production case study (ZenML LLMOps DB 2024) reports Effect-TS's compile-time-verified dependency injection raised agent-system reliability across LLM provider boundaries. The corollary for agent-authored code: pure cores are easy for agents to test, easy to reason about, and easy to mutation-test; imperative shells should be small enough to inspect by eye. Result types and discriminated-union errors (neverthrow, Effect, native TypeScript) outperform thrown exceptions because both branches appear in the signature — the agent cannot accidentally swallow an error path it cannot see.

**Incorrect (pure logic and side effects entangled; exceptions hide the failure path):**

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

**Correct (pure core; imperative shell handles all I/O; errors surface in signatures):**

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

References:
- [Google Testing Blog — Simplify Your Code: Functional Core, Imperative Shell (Oct 2025)](https://testing.googleblog.com/2025/10/simplify-your-code-functional-core.html)
- [Bernhardt — Functional Core, Imperative Shell (DestroyAllSoftware)](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell)
- [Shore — Testing Without Mocks: A Pattern Language (2023 update)](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks)
- [Constraint Decay: The Fragility of LLM Agents in Backend Code Generation (arXiv 2605.06445)](https://arxiv.org/abs/2605.06445)
- [14.ai — Building Reliable AI Agent Systems with Effect TypeScript (ZenML LLMOps DB 2024)](https://www.zenml.io/llmops-database/building-reliable-ai-agent-systems-with-effect-typescript-framework)
- [Sólberg — Practically Safe TypeScript Using Neverthrow](https://www.solberg.is/neverthrow)
- [Effect — The Best Way to Build Robust Apps in TypeScript](https://effect.website/)

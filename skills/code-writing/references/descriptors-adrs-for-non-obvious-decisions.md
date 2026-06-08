---
title: Record Every Non-Obvious Design Decision as an ADR
impact: HIGH
tags: descriptors, adrs, decision-records, vibe-architecting, traceability
---

## Record Every Non-Obvious Design Decision as an ADR

**Impact: HIGH**

"Architecture Without Architects" (arXiv 2604.04990, 2026) coins "vibe architecting" — the empirical finding that the same prompt produces systems ranging from 141 to 827 LOC and 2 to 6 files. The paper identifies five mechanisms and six coupling patterns by which prompt wording silently fixes architecture without explicit decision, and proposes ADRs extracted from agent reasoning traces as the corrective. Without ADRs, an agent reading the repo cannot distinguish a deliberate constraint ("ledger amounts are minor units because of float drift") from an accidental convention ("the first author happened to write it that way") — and it will rewrite the deliberate constraint as cheerfully as the accidental one. ADRs encode the implicit ontology that the code alone cannot recover, and they live alongside the code so the agent loads them with the relevant module.

**Incorrect (a load-bearing decision is invisible — the next agent breaks it):**

```ts
// in src/services/billing/billing.service.ts
// amounts stored as bigint; no rationale anywhere in the repo
async function recordPayment(amountMinorUnits: bigint) { ... }
```

**Correct (a small ADR encodes the rationale, the alternatives considered, and the consequences):**

```
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

References:
- [Architecture Without Architects: How AI Coding Agents Shape Software Architecture (arXiv 2604.04990, 2026)](https://arxiv.org/abs/2604.04990)
- [Codified Context: Infrastructure for AI Agents in a Complex Codebase (arXiv 2602.20478, 2026)](https://arxiv.org/abs/2602.20478)
- [Decoding the Configuration of AI Coding Agents (arXiv 2511.09268)](https://arxiv.org/abs/2511.09268)
- [Chen et al. — A Deep Dive Into LLM Code Generation Mistakes](https://arxiv.org/abs/2411.01414)
- [AGENTS.md open specification](https://agents.md/)

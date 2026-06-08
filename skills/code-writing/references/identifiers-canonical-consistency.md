---
title: Use One Canonical Name Per Concept Across the Entire Repository
impact: CRITICAL
tags: identifiers, consistency, ontology, vocabulary, cross-file
---

## Use One Canonical Name Per Concept Across the Entire Repository

**Impact: CRITICAL**

When the same domain concept appears under multiple labels (`Customer`, `Client`, `User`, `Account` for the same legal entity), LLM agents lose the cross-file edge that would otherwise let them traverse the repository as a graph. Multi-SWE-bench (2025) and CrossCodeEval (NeurIPS 2023) both report sharp accuracy drops on cross-file edits, and DependEval (ACL 2025) isolates dependency-recognition as a gating skill that fails when terminology drifts. Liu et al.'s coding-style consistency study (2024) shows agents inherit and amplify their training corpus's style priors — a codebase with inconsistent naming trains every subsequent agent edit to be more inconsistent. The strongest signal for cross-file agent comprehension is that any concept resolves to exactly one identifier from any call site.

**Incorrect (the same domain entity surfaces under three competing labels — agent cannot link related files):**

```ts
// services/billing.ts
export interface Customer { id: string; balance: number; }

// services/identity.ts
export interface User { id: string; email: string; }

// services/compliance.ts
export interface Account { id: string; jurisdiction: string; }

// callers must triangulate that Customer.id === User.id === Account.id
```

**Correct (one canonical term; specializations declare their relation to it):**

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

References:
- [Multi-SWE-bench: A Multilingual Benchmark for Issue Resolving](https://arxiv.org/abs/2504.02605)
- [CrossCodeEval: A Diverse and Multilingual Benchmark for Cross-File Code Completion](https://arxiv.org/abs/2310.11248)
- [DependEval: Benchmarking LLMs for Repository Dependency Understanding](https://aclanthology.org/2025.findings-acl.373.pdf)
- [Liu et al. — Beyond Functional Correctness: Investigating Coding Style Inconsistencies in LLMs](https://arxiv.org/abs/2407.00456)
- [RepoBench: Benchmarking Repository-Level Code Auto-Completion Systems](https://arxiv.org/abs/2306.03091)

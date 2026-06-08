---
title: Write Comments That Explain WHY, Not WHAT — Especially at Non-Obvious Constraints
impact: HIGH
tags: composition, comments, intent, invariants, semantic-density
---

## Write Comments That Explain WHY, Not WHAT — Especially at Non-Obvious Constraints

**Impact: HIGH**

Code Needs Comments (ACL 2024 Findings) reports that comment density meaningfully affects downstream LLM task performance, but only when comments add information not derivable from the code itself. WHAT-comments duplicate the implementation and inflate context cost without lifting accuracy; WHY-comments encode hidden constraints, ordering invariants, performance budgets, security boundaries, and workaround rationale — information the agent cannot recover from the AST. The "Hidden Cost of Readability" study (arXiv 2508.13666, 2025) shows that comment volume costs tokens model-dependently — Gemini-1.5 degrades 3-4% with aggressive formatting, while Claude and GPT-4o tolerate dense formatting — so the bias should be toward few, dense, high-signal WHY-comments rather than blanket prose. Restrict comments to: invariants the type system cannot express, rationale for non-obvious choices, references to external constraints (specs, tickets, incidents), and explicit warnings.

**Incorrect (comments restate the code; no constraint encoded):**

```ts
// Increment count by 1
count += 1;

// Loop through users
for (const user of users) {
  // Set active to true
  user.active = true;
}

// Return the result
return result;
```

**Correct (comments encode invariants and rationale the type system can't):**

```ts
// Ledger amounts are stored in minor units (cents) to avoid float drift across
// currency conversions; do NOT introduce decimal types here without coordinating
// with the reconciliation service (see ADR-0014).
const totalMinorUnits = entries.reduce((sum, entry) => sum + entry.amountMinorUnits, 0);

// Process newest-first: the deduplication step downstream assumes entries are
// in non-increasing occurredAt order so duplicates collapse onto the newest.
const ordered = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

// Hash the email lowercased + trimmed: required by RFC 5321 §2.4 for case-fold
// equivalence; tests/identity.spec.ts pins the expected hashes.
const emailHash = sha256(email.trim().toLowerCase());
```

References:
- [Yang et al. — Code Needs Comments (ACL 2024 Findings)](https://aclanthology.org/2024.findings-acl.809.pdf)
- [The Hidden Cost of Readability: How Code Formatting Silently Consumes Your LLM Budget](https://arxiv.org/abs/2508.13666)
- [Zhang et al. — How Accurately Do Large Language Models Understand Code?](https://arxiv.org/abs/2504.04372)
- [Empica — An Empirical Study on Capability of LLMs in Understanding Code Semantics](https://arxiv.org/abs/2407.03611)

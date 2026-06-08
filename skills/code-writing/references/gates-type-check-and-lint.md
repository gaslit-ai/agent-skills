---
title: Gate Every Commit With Strict Type-Checking and Naming/Style Lint
impact: CRITICAL
tags: gates, typescript-strict, lint, ci, mechanical-enforcement
---

## Gate Every Commit With Strict Type-Checking and Naming/Style Lint

**Impact: CRITICAL**

The properties prescribed in the prior sections — descriptive names, canonical terminology, strong types, acyclic imports, explicit module surfaces — drift under agent authorship unless mechanically enforced at write-time and merge-time. Liu et al.'s coding-style consistency study (2024) reports that agents inherit and amplify style priors from surrounding code; any unenforced inconsistency trains the next edit to be more inconsistent. Mündler et al.'s PLDI 2025 result that type-constrained generation reduces compile errors by >50% only holds when the type checker is actually run — and not run after the fact, when the agent has already moved on. Strict type-checking, naming/style lint, and import-cycle detection should be a pre-commit hook AND a CI gate, configured to FAIL the build rather than warn. Warnings are ignored; broken builds are fixed.

**Incorrect (no gates; the next agent edit silently introduces `any`, cycles, and ad-hoc names):**

```json
// tsconfig.json — permissive
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}

// package.json — no checks gated
{
  "scripts": {
    "build": "tsc",
    "test": "vitest"
  }
}
```

**Correct (gates enforce the ontology before code lands):**

```json
// tsconfig.json — strict + module-cycle detection
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true
  }
}

// package.json — pre-commit + CI gates
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "lint:cycles": "madge --circular --extensions ts src/",
    "lint:names": "eslint . --rule '@typescript-eslint/naming-convention: error'",
    "verify": "pnpm typecheck && pnpm lint && pnpm lint:cycles && pnpm test"
  },
  "lint-staged": {
    "*.ts": ["pnpm typecheck", "pnpm lint --fix", "pnpm lint:cycles"]
  }
}

// .github/workflows/ci.yml — same checks, failing-mode
// - run: pnpm verify
```

References:
- [Mündler et al. — Type-Constrained Code Generation (PLDI 2025)](https://arxiv.org/abs/2504.09246)
- [Liu et al. — Beyond Functional Correctness: Coding Style Inconsistencies in LLMs](https://arxiv.org/abs/2407.00456)
- [AI-Generated Smells: Code and Architecture in LLM- and Agent-Driven Development (arXiv 2605.02741)](https://arxiv.org/abs/2605.02741)
- [Chen et al. — A Deep Dive Into LLM Code Generation Mistakes](https://arxiv.org/abs/2411.01414)
- [Cordeiro et al. — Empirical Study on Code Refactoring Capability of LLMs (TOSEM 2025)](https://arxiv.org/abs/2411.02320)

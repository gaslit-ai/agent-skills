---
title: Enforce Tag-Based Package Boundaries So Workspaces Form a Layered Dependency Graph
impact: HIGH
tags: monorepo, package-boundaries, nx-tags, packwerk, spring-modulith, workspace-rules
---

## Enforce Tag-Based Package Boundaries So Workspaces Form a Layered Dependency Graph

**Impact: HIGH**

A monorepo without enforced inter-package boundaries is a single giant heap that defeats the purpose of having packages at all. Nx's `@nx/enforce-module-boundaries` ESLint rule (the canonical specification) uses tag pairs — *scope* (which domain the package belongs to) and *type* (which architectural layer) — to express rules like "a feature can depend on a lib but not vice versa," or "the api scope may not depend on the marketing scope." Shopify's Packwerk does the equivalent for Ruby monoliths via static constant resolution, with privacy and dependency rules per "pack"; Spring Modulith plus ArchUnit-backed fitness functions provide the JVM equivalent. The empirical case for these is the same as for hexagonal direction generally: the 0%-vs-80% violation gap reported in arXiv 2512.04273 when architecture is enforced versus described. For agent comprehension, tag-based rules give the LLM a typed dependency graph at the workspace level — an extra layer of orientation above the file-level import graph — and they let cross-package boundaries be enforced *mechanically* by CI, not by reviewer attention. The 2025–2026 Nx work on AI agent skills and Datadog's "Steering AI Agents in Monorepos with AGENTS.md" both lean on the assumption that workspace boundaries are well-defined enough to scope per-package conventions; this rule is what makes that assumption hold.

**Incorrect (workspace with packages but no boundary rules — every package can import every other):**

```jsonc
// nx.json — no targetDefaults for module boundaries
{
  "namedInputs": { "default": ["{projectRoot}/**/*"] }
}

// any project can import any other; the dependency graph is unbounded
// packages/marketing-site/app/page.tsx
import { internalPaymentToken } from '../../../packages/payments-service/src/internal';
```

**Correct (project.json tags + ESLint rule enforce a layered, scoped graph):**

```jsonc
// packages/domain-billing/project.json
{ "name": "domain-billing", "tags": ["scope:billing", "type:domain"] }

// packages/feature-billing-summary/project.json
{ "name": "feature-billing-summary", "tags": ["scope:billing", "type:feature"] }

// packages/marketing-site/project.json
{ "name": "marketing-site", "tags": ["scope:marketing", "type:app"] }

// .eslintrc.json  (or nx.json depConstraints in newer Nx)
{
  "rules": {
    "@nx/enforce-module-boundaries": ["error", {
      "depConstraints": [
        { "sourceTag": "scope:billing",   "onlyDependOnLibsWithTags": ["scope:billing", "scope:shared"] },
        { "sourceTag": "scope:marketing", "onlyDependOnLibsWithTags": ["scope:marketing", "scope:shared"] },
        { "sourceTag": "type:app",     "onlyDependOnLibsWithTags": ["type:feature", "type:lib", "type:domain"] },
        { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:lib", "type:domain"] },
        { "sourceTag": "type:lib",     "onlyDependOnLibsWithTags": ["type:lib", "type:domain"] },
        { "sourceTag": "type:domain",  "onlyDependOnLibsWithTags": ["type:domain"] }
      ]
    }]
  }
}
```

References:
- [Nx — Enforce Module Boundaries](https://nx.dev/features/enforce-module-boundaries)
- [Nx — Integrated Repos vs. Package-Based Repos](https://nx.dev/concepts/decisions/integrated-vs-package-based)
- [Shopify — Enforcing Modularity in Rails Apps with Packwerk](https://shopify.engineering/enforcing-modularity-rails-apps-packwerk)
- [Shopify — A Packwerk Retrospective](https://shopify.engineering/a-packwerk-retrospective)
- [Spring Modulith Reference](https://docs.spring.io/spring-modulith/reference/)
- [Tengstrand — The Polylith Architecture](https://medium.com/@joakimtengstrand/the-polylith-architecture-1eec55c5ebce)
- [Quantitative Pattern Conformance in AI-Synthesized Microservices (arXiv 2512.04273)](https://arxiv.org/pdf/2512.04273)

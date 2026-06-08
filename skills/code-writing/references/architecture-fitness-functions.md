---
title: Encode Architecture as Executable Fitness Functions, Not Prose
impact: CRITICAL
tags: architecture, fitness-functions, archunit, dependency-cruiser, ts-arch, governance
---

## Encode Architecture as Executable Fitness Functions, Not Prose

**Impact: CRITICAL**

Prose architecture documents drift the moment the first agent merges a PR; executable fitness functions do not. "Building Evolutionary Architectures, 2nd ed." (Ford/Parsons/Kua/Sadalage, 2023) codifies the discipline of expressing every architectural invariant as a runnable check. The "Quantitative Analysis of Technical Debt and Pattern Conformance in AI-Synthesized Microservices" study (arXiv 2512.04273, 2025) measures this empirically: under Hexagonal Architecture rules enforced mechanically, GPT-5.1 produced 0% direction-violations while Llama 3 8B produced 80% (illegal circular dependencies). Same prompt, same model family lineage — the gap is entirely explained by whether the architecture was *enforced* or merely *described*. ArchUnit (Java), ArchUnitTS, dependency-cruiser, ts-arch, and Packwerk are the canonical mechanisms; ThoughtWorks Technology Radar (Vol 31, Oct 2024) explicitly recommends "dependency drift fitness function" as a tracked metric. The skill's hypothesis — code as the LLM's orienting knowledge graph — only works if the graph stays well-formed under agent edits, and only fitness functions guarantee that.

**Incorrect (architecture asserted in a README, enforced nowhere):**

```md
<!-- docs/architecture.md -->

# Architecture

- Domain code never imports services.
- Services never import HTTP/transport layer.
- Repositories implement interfaces defined in domain.

(There is no test, no lint rule, no CI gate. The next agent will violate at least one.)
```

**Correct (rules expressed as runnable dependency-cruiser config, gated in CI):**

```js
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-services',
      severity: 'error',
      comment: 'Domain types are pure; they MUST NOT depend on services or transport.',
      from: { path: '^src/domain' },
      to:   { path: '^src/(services|transport)' },
    },
    {
      name: 'no-services-to-transport',
      severity: 'error',
      comment: 'Services MUST NOT depend on HTTP/transport (hexagonal direction).',
      from: { path: '^src/services' },
      to:   { path: '^src/transport' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Cycles break hierarchical localization and confuse repo-graph retrieval.',
      from: {},
      to:   { circular: true },
    },
  ],
  options: { tsConfig: { fileName: 'tsconfig.json' } },
};

// package.json
{
  "scripts": {
    "lint:arch": "depcruise --config .dependency-cruiser.cjs --validate src",
    "verify": "pnpm typecheck && pnpm lint && pnpm lint:arch && pnpm test"
  }
}
```

References:
- [Ford, Parsons, Kua, Sadalage — Building Evolutionary Architectures, 2nd ed. (O'Reilly 2023)](https://www.oreilly.com/library/view/building-evolutionary-architectures/9781492097532/)
- [Quantitative Analysis of Pattern Conformance in AI-Synthesized Microservices (arXiv 2512.04273)](https://arxiv.org/pdf/2512.04273)
- [The Modular Imperative: Rethinking LLMs for Maintainable Software (Harvard 2024)](https://namin.seas.harvard.edu/pubs/lmpl-modularity.pdf)
- [ThoughtWorks — Dependency Drift Fitness Function (Tech Radar Vol 31)](https://www.thoughtworks.com/radar/techniques/dependency-drift-fitness-function)
- [dependency-cruiser (Sander Verweij)](https://github.com/sverweij/dependency-cruiser)
- [ArchUnitTS (Lukas Niessen)](https://lukasniessen.github.io/ArchUnitTS/)
- [Shopify — Enforcing Modularity in Rails Apps with Packwerk](https://shopify.engineering/enforcing-modularity-rails-apps-packwerk)

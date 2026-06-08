---
title: Place AGENTS.md at Every Package Root; Nearest-File-Wins as Default
impact: HIGH
tags: monorepo, agents-md, claude-md, tiered-descriptors, datadog, stripe-minions
---

## Place AGENTS.md at Every Package Root; Nearest-File-Wins as Default

**Impact: HIGH**

A monolithic root-level AGENTS.md stops scaling at roughly 10,000 lines of code — the empirical finding from "Codified Context" (arXiv 2602.20478, 2026), validated on a 108k-LOC system across 283 sessions. In a real monorepo (50–500 packages, hundreds of thousands of files), a single root descriptor is not just inadequate, it is *misleading*: the conventions of `packages/payments-service/` are inevitably different from `packages/marketing-site/`. The AGENTS.md specification (Agentic AI Foundation, 2025) defines the resolution rule cleanly: **the AGENTS.md nearest to the edited file wins** over the root file, with explicit chat prompts overriding both. Datadog's frontend team published the canonical industry post on this pattern ("Steering AI Agents in Monorepos with AGENTS.md") with per-package files for each scope. Stripe's Minions write-up (2025) is even more direct — at hundreds-of-millions-of-lines scale, **agent rules are conditionally applied per subdirectory because a single global rule file would be useless at their scale**. Anthropic's own enterprise guidance for Claude Code recommends the same hierarchy. The corollary: every package root in a monorepo should carry a focused AGENTS.md/CLAUDE.md that lists its invariants, public surface, tests, allowed upstream deps, and forbidden patterns. The root descriptor documents workspace-wide conventions and points to the per-package files.

**Incorrect (single 800-line root AGENTS.md tries to cover everything; per-package conventions vanish):**

```
repo/
  AGENTS.md     # 800 lines covering payments, marketing, mobile, infra, all in one
  packages/
    payments-service/
      src/
      tests/
    marketing-site/
      src/
    mobile-app/
      src/
```

**Correct (root descriptor + per-package descriptors; nearest-wins resolution):**

```
repo/
  AGENTS.md
  packages/
    payments-service/
      AGENTS.md                          # payments-specific rules
      src/
    marketing-site/
      AGENTS.md                          # marketing-specific rules
      src/
    mobile-app/
      AGENTS.md                          # mobile-specific rules
      src/
  docs/
    decisions/
      0014-ledger-amounts-as-minor-units.md
```

```md
<!-- repo/AGENTS.md (root — covers conventions that apply to the whole workspace) -->
# AGENTS.md — workspace root

This monorepo is organized by package under `packages/`. Each package owns
its own `AGENTS.md` with conventions specific to that package; resolution is
nearest-file-wins per the AGENTS.md spec.

## Workspace-wide rules
- TypeScript strict; no `any`. See `tsconfig.base.json`.
- Tag-based boundaries enforced by `@nx/enforce-module-boundaries`.
- Run `pnpm nx affected:graph --base=origin/main` before editing across packages.

## Where to look first
- `packages/payments-service/AGENTS.md` — billing, ledger, reconciliation.
- `packages/marketing-site/AGENTS.md` — public site, CMS integration.
- `packages/mobile-app/AGENTS.md` — React Native client.
- `docs/decisions/` — ADRs that apply across packages.
```

```md
<!-- repo/packages/payments-service/AGENTS.md (per-package) -->
# AGENTS.md — payments-service

## Intent
Owns billing, ledger writes, and reconciliation.

## Invariants
- All amounts are bigint minor units (ADR-0014). NEVER introduce floats.
- The ledger is append-only; updates use compensating entries.

## Public surface
- Exported from `src/index.ts`. Anything not re-exported is internal.

## Allowed dependencies
- May depend on: `@workspace/domain-billing`, `@workspace/shared-types`.
- May NOT depend on: `marketing-site`, `mobile-app`, anything in `apps/`.

## Tests
- `pnpm nx test payments-service` (unit)
- `pnpm nx e2e payments-service-e2e` (integration; requires devbox)
```

References:
- [AGENTS.md open specification](https://agents.md/)
- [Datadog — Steering AI Agents in Monorepos with AGENTS.md](https://dev.to/datadog-frontend-dev/steering-ai-agents-in-monorepos-with-agentsmd-13g0)
- [Stripe — Minions: One-Shot End-to-End Coding Agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Codified Context: Infrastructure for AI Agents in a Complex Codebase (arXiv 2602.20478)](https://arxiv.org/abs/2602.20478)
- [Decoding the Configuration of AI Coding Agents (arXiv 2511.09268)](https://arxiv.org/abs/2511.09268)
- [Anthropic — Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Anthropic — How Anthropic Teams Use Claude Code (Advanced Patterns)](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf)

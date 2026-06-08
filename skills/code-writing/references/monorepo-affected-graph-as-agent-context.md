---
title: Expose the Affected/Build Graph as the Agent's Primary Navigation Primitive
impact: HIGH
tags: monorepo, affected-graph, bazel, buck2, turborepo, nx-affected, mcp-tools
---

## Expose the Affected/Build Graph as the Agent's Primary Navigation Primitive

**Impact: HIGH**

Modern monorepo build systems — Bazel, Buck2, Turborepo, Nx, moon — all compute a *project graph* and an *affected set* given a changed file: a precise, machine-readable answer to "what depends on this, and what tests need to run?" Surfacing that graph to the agent is empirically the highest-leverage retrieval tool a monorepo can offer. **Sourcegraph's CodeScaleBench (2025) reports file recall rises from 0.127 to 0.277 and Precision@5 from 0.140 to 0.478 when agents call workspace-aware MCP tools instead of grep-and-pray retrieval — across enterprise-scale codebases (≥1M LOC, multi-language, multi-repo).** Stripe's Minions (2025) ship ~1,300 autonomous PRs per week into a hundreds-of-millions-of-lines monorepo specifically because the agent is bootstrapped with deterministic pre-hydration tool calls — including affected-graph queries — before the LLM loop ever starts. Nx's published AI agent skills (`nx-workspace`, `nx-run-tasks`, plus self-healing CI via MCP) make this pattern explicit; Turborepo's AI guide does the same for pnpm-workspace monorepos; the `bazel-mcp-server` exposes `bazel query` to agents. The corollary for any agent-tractable monorepo: package the affected-graph and the workspace-graph as agent-callable tools (MCP, CLI, or both), and instruct AGENTS.md / CLAUDE.md to call them before opening files.

**Incorrect (agent reaches for grep across the whole monorepo because no graph tool is exposed):**

```bash
# agent's tool inventory: just `bash`
$ grep -r "LegalPartyId" .
# scans 200,000 files; returns 12,000 matches; agent dumps half into context
```

**Correct (workspace exposes the project graph and affected set as agent tools):**

```bash
# package.json or AGENTS.md describes these as preferred entry points

# 1. Resolve the workspace project graph (what packages exist; how they depend)
$ pnpm nx graph --file=/tmp/graph.json
# or
$ bazel query --output=graph //...

# 2. Compute the affected set for the current branch — agent uses this to scope edits
$ pnpm nx affected:graph --base=origin/main
$ pnpm nx affected -t test --base=origin/main

# 3. From a single symbol, find packages that depend on it (workspace-aware reverse-deps)
$ bazel query "rdeps(//..., //packages/domain-billing:legal_party)"
```

```jsonc
// AGENTS.md at the repository root (excerpt)
// Tools you SHOULD use before reading files:
//   - `pnpm nx affected:graph --base=origin/main`   — scope of impacted packages
//   - `pnpm nx graph`                                — full workspace graph
//   - Bazel: `bazel query "rdeps(//..., <target>)"`  — reverse dependencies
// Tools you should NOT use for navigation:
//   - `grep -r` across the workspace (use the project graph; it is faster and precise)
```

References:
- [Nx AI Agent Skills (Nrwl)](https://nx.dev/blog/nx-ai-agent-skills)
- [Nx — Enhance AI features](https://nx.dev/docs/features/enhance-ai)
- [Turborepo — AI guide](https://turborepo.dev/docs/guides/ai)
- [Bazel — Official site](https://bazel.build/)
- [Buck2 announcement (Meta)](https://engineering.fb.com/2023/04/06/open-source/buck2-open-source-large-scale-build-system/)
- [CodeScaleBench — Sourcegraph (2025)](https://sourcegraph.com/blog/codescalebench-testing-coding-agents-on-large-codebases-and-multi-repo-software-engineering-tasks)
- [Stripe Minions — One-Shot End-to-End Coding Agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Selective Test Execution at Stripe](https://stripe.dev/blog/selective-test-execution-at-stripe-fast-ci-for-a-50m-line-ruby-monorepo)
- [Software Engineering at Google — Large-Scale Changes (Ch. 22)](https://abseil.io/resources/swe-book/html/ch22.html)
- [DependEval — Benchmarking Repository Dependency Understanding (ACL 2025)](https://aclanthology.org/2025.findings-acl.373/)

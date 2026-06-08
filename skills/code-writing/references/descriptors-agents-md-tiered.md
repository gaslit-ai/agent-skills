---
title: Maintain a Tiered AGENTS.md Map — Root Contract, Per-Module Specs, Sub-Agent Definitions
impact: HIGH
tags: descriptors, agents-md, claude-md, tiered-context, scaling
---

## Maintain a Tiered AGENTS.md Map — Root Contract, Per-Module Specs, Sub-Agent Definitions

**Impact: HIGH**

Formal architecture descriptors are the single highest-leverage navigation aid for coding agents. A 2026 field study of 7,012 Claude Code sessions reports that structured descriptors (module boundaries, symbol signatures, constraints, data flows) cut agent navigation steps by 33–44 percent (Wilcoxon p=0.009, Cohen's d=0.92) and reduce behavioral variance by 52 percent — and the file format (S-expression, JSON, YAML, Markdown) is statistically irrelevant; what matters is the *presence* of a formal map. AGENTS.md (Linux Foundation, 2025) is the vendor-neutral standard backed by OpenAI Codex, Cursor, Amp, Jules, and Factory. The "Codified Context" study (arXiv 2602.20478) validates on a 108k-LOC C# system across 283 sessions that single-file manifests stop scaling at roughly 10k lines — past that point the descriptor must tier into a root contract, per-module specs, and sub-agent definitions. The empirical analysis of 328 public CLAUDE.md files (arXiv 2511.09268, Nov 2025) catalogs which concerns developers encode: project overview, development guidelines, architectural constraints, tool policies — making this set the de facto ontology entry point.

**Incorrect (no root descriptor, or one monolithic README; agent must reconstruct architecture from filenames alone):**

```
repo/
  README.md   # 80 lines, mostly install instructions
  src/
  tests/
```

**Correct (tiered descriptor — root contract, module specs, sub-agent definitions):**

```
repo/
  AGENTS.md                # root contract: build/test/conventions/architecture overview
  .claude/
    agents/
      reviewer.md          # sub-agent for PR review
      refactor.md          # sub-agent for refactoring tasks
  docs/
    decisions/
      0001-typescript-strict.md
      0014-ledger-minor-units.md
  src/
    domain/
      legal-party/
        AGENTS.md          # module spec: invariants, public API, tests, owners
      billing-event/
        AGENTS.md
    services/
      billing/
        AGENTS.md
```

`AGENTS.md` at the repository root must minimally cover: project intent, build command, test command, naming conventions, type strictness, where ADRs live, and where to look first when modifying each major concern. Per-module `AGENTS.md` files cover: invariants, public surface, tests, and the upstream/downstream modules in the dependency graph.

References:
- [Formal Architecture Descriptors as Navigation Primitives for AI Coding Agents (arXiv 2604.13108, 2026)](https://arxiv.org/abs/2604.13108)
- [Codified Context: Infrastructure for AI Agents in a Complex Codebase (arXiv 2602.20478, 2026)](https://arxiv.org/abs/2602.20478)
- [Decoding the Configuration of AI Coding Agents: Insights from Claude Code Projects (arXiv 2511.09268, Nov 2025)](https://arxiv.org/abs/2511.09268)
- [AGENTS.md open specification (Agentic AI Foundation, Linux Foundation)](https://agents.md/)
- [Effective Context Engineering for AI Agents (Anthropic Engineering, 2025)](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Claude Code Best Practices (Anthropic Engineering)](https://www.anthropic.com/engineering/claude-code-best-practices)

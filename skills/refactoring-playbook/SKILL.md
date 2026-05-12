---
name: refactoring-playbook
description: Evidence-based refactoring playbook distilled from empirical software engineering research. Use when planning, executing, or reviewing refactoring work — when to refactor, how to refactor safely, how to use automation and LLM assistance, and how to measure success. Triggers on tasks framed as "refactor", "clean up", "extract method", "rename", "migrate", "modernize", or "reduce tech debt".
license: MIT
allowed-tools: Bash(scripts/hotspots.sh:*) Bash(hotspot:*) Bash(git:*) Bash(jq:*)
metadata:
  author: duke
  version: "0.1.0"
---

# Refactoring Playbook

Evidence-based guidance for refactoring code bases. Grounded in primary studies from ACM/IEEE venues, industrial reports, and recent AI-assisted refactoring evaluations.

## When to Apply

- Planning a refactor and deciding whether it is worth doing now
- Reviewing a PR that mixes refactoring with feature or bug work
- Choosing between manual, IDE, codemod, or LLM-assisted refactoring
- Defining success criteria before declaring a refactor "done"
- Scoping a large migration (framework, library, or API)

## When Not to Apply

- Pure feature work with no structural cleanup intent
- Pure bug fixes that do not touch surrounding structure
- Greenfield design — the playbook is about restructuring existing code

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Triggers — when and why to refactor | CRITICAL | `triggers-` |
| 2 | Safety — how to refactor without breaking behavior | CRITICAL | `safety-` |
| 3 | Review — collaboration and merge discipline | HIGH | `review-` |
| 4 | Automation — tools, codemods, and LLM assistance | HIGH | `automation-` |
| 5 | Measurement — judging refactor success | MEDIUM | `measure-` |

## Quick Reference

- `triggers-behavior-preserving` — refactoring preserves external behavior; if behavior changes, it is not refactoring
- `triggers-pain-driven` — start from concrete maintenance pain, not aesthetic preference
- `triggers-hot-files` — prioritize files that change often or repeatedly block edits
- `triggers-readability` — readability and comprehension are first-class refactor goals
- `safety-small-steps` — many small transformations beat one large redesign
- `safety-tests-first` — strengthen the regression net before risky structural change
- `safety-separate-mechanical` — separate mechanical edits from behavior-changing edits
- `safety-verify-after` — rerun tests and static analysis after every refactor batch
- `review-small-prs` — keep refactor PRs small and short-lived
- `review-intent-commits` — commit messages explain refactor intent, not just "cleanup"
- `automation-semantic-tools` — prefer semantic codemods over regex search-and-replace
- `automation-llm-local` — LLM assistance is strongest on local, systematic transformations
- `automation-keep-oversight` — LLMs accelerate migration mechanics; they do not replace tests or review
- `measure-portfolio` — judge with a portfolio of indicators, not a single metric
- `measure-smell-not-safety` — smell reduction is not proof of semantic safety

## How to Use

1. Identify the **trigger** — why is this refactor happening now?
2. Pick the **safety** rules that apply to the scope of change.
3. Choose **automation** only when the transformation is repetitive and analyzable.
4. Plan **review** before opening the PR — what is the smallest reviewable unit?
5. Define **measurement** up front — what evidence will declare success?

Read individual rule files in `rules/` for examples. The compiled long-form guide is `AGENTS.md`.

## Full Compiled Document

For expanded guidance with grouped sections, see `AGENTS.md`.

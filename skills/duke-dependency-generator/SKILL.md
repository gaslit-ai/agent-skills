---
name: duke-dependency-generator
description: Dependency and architecture graph generation playbook for TypeScript repositories. Use when implementing or upgrading `npm run arch` style workflows with dependency-cruiser plus ts-morph call/type graphs. Triggers on creating or refactoring architecture graph generation workflows.
license: MIT
metadata:
  author: duke
  version: "0.1.0"
---

# Duke Dependency Generator

Principal-level implementation guide for adding reproducible architecture graph generation (dependency, call, and type graphs) to any TypeScript repository. Built on `dependency-cruiser` + `ts-morph` + `fast-glob`.

Each reference below is a separate file in `references/`; the agent loads only the references it needs for the current task. The fully expanded long-form guide lives in `AGENTS.md` for tools that follow the [AGENTS.md convention](https://agents.md) rather than the [Agent Skills spec](https://agentskills.io/specification).

## First Step (Required)

Install the analysis libraries before doing anything else:

```bash
npm install --save-dev dependency-cruiser ts-morph fast-glob
```

## References

### 1. Bootstrap and Toolchain — **CRITICAL**

Installation and initialization mistakes are the most common cause of failed architecture workflows.

- [`bootstrap-install-toolchain`](./references/bootstrap-install-toolchain.md) — Install Required Analysis Libraries Before Any Init Step

### 2. Scope and Project Model — **CRITICAL**

Graph quality depends on accurate include/exclude scope and a dedicated analysis TS project.

- [`scope-tsconfig-arch`](./references/scope-tsconfig-arch.md) — Use a Dedicated tsconfig.arch.json for Analysis Scope

### 3. Dependency Graph Generation — **HIGH**

Dependency graph customization must preserve repository-specific resolver behavior.

- [`deps-merge-base-config`](./references/deps-merge-base-config.md) — Merge Mermaid Output Options with Generated depcruise Config

### 4. Type Graph Generation — **HIGH**

Type graph output must remain bounded and deterministic to stay useful in large repositories.

- [`types-deterministic-ids-and-sort`](./references/types-deterministic-ids-and-sort.md) — Keep Type Graph IDs and Ordering Deterministic

### 5. Callgraph Generation — **HIGH**

Entrypoint selection is the main signal control for callgraph value and noise.

- [`callgraph-entrypoint-selection`](./references/callgraph-entrypoint-selection.md) — Seed Callgraph from Real Ingress Entrypoints

### 6. CLI Contract — **HIGH**

Strict argument validation prevents confusing runtime failures and non-deterministic behavior.

- [`cli-validate-arguments`](./references/cli-validate-arguments.md) — Validate CLI Arguments Before Execution

### 7. Verification and Determinism — **MEDIUM**

Deterministic outputs allow diff-based review and CI enforcement.

- [`verify-repeatability`](./references/verify-repeatability.md) — Prove Repeatability with Diff-Based Re-Runs

### 8. Operational Hygiene — **MEDIUM**

Keep implementation gotchas explicit so teams do not rediscover the same failure modes.

- [`ops-document-gotchas`](./references/ops-document-gotchas.md) — Keep a Living GOTCHA Log for Recurring Failure Modes

## Full Compiled Document

For the complete guide with every reference expanded inline (bad/good examples, citations, prerequisites), see [`AGENTS.md`](./AGENTS.md). It is the [AGENTS.md-convention](https://agents.md) fallback for tools that do not load individual references on demand.

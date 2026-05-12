# Sections

This file defines section ordering, impact, and reference filename prefixes.

---

## 1. Bootstrap and Toolchain (bootstrap)

**Impact:** CRITICAL
**Description:** Installation and initialization mistakes are the most common cause of failed architecture workflows.

## 2. Scope and Project Model (scope)

**Impact:** CRITICAL
**Description:** Graph quality depends on accurate include/exclude scope and a dedicated analysis TS project.

## 3. Dependency Graph Generation (deps)

**Impact:** HIGH
**Description:** Dependency graph customization must preserve repository-specific resolver behavior.

## 4. Type Graph Generation (types)

**Impact:** HIGH
**Description:** Type graph output must remain bounded and deterministic to stay useful in large repositories.

## 5. Callgraph Generation (callgraph)

**Impact:** HIGH
**Description:** Entrypoint selection is the main signal control for callgraph value and noise.

## 6. CLI Contract (cli)

**Impact:** HIGH
**Description:** Strict argument validation prevents confusing runtime failures and non-deterministic behavior.

## 7. Verification and Determinism (verify)

**Impact:** MEDIUM
**Description:** Deterministic outputs allow diff-based review and CI enforcement.

## 8. Operational Hygiene (ops)

**Impact:** MEDIUM
**Description:** Keep implementation gotchas explicit so teams do not rediscover the same failure modes.

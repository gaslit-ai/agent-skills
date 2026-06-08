# Code Writing

Evidence-based rules for writing code as a knowledge graph that orients agentic AI in vector space.

The hypothesis: hardened authoring rules covering identifier semantics, type contracts, repository-graph layout, in-file composition, architectural descriptors, and validation gates compound as a codebase grows. Each additional file extends the orienting structure rather than fragmenting it, and reading the repo hierarchically co-locates the LLM in the appropriate region of vector space.

Rules are derived from empirical studies of how LLMs and agents consume code (SWE-bench, RepoGraph, type-constrained decoding, identifier-obfuscation studies, formal architecture descriptors, JSON-Schema benchmarks), not from human-ergonomics traditions alone.

- `SKILL.md` — generated entrypoint for skill-aware tools.
- `AGENTS.md` — generated long-form fallback for [AGENTS.md-convention](https://agents.md) tools.
- `references/` — per-rule files with empirical evidence, bad/good examples, and citations.
- `metadata.json` — source of truth for skill-level fields.

Do not hand-edit `SKILL.md` or `AGENTS.md`; run the build from `packages/skills-build`.

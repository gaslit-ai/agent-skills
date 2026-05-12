# AGENTS.md

This repository stores reusable agent skills and a deterministic build pipeline that compiles each skill into the [Agent Skills spec](https://agentskills.io/specification) format.

## Skill Layout

```text
skills/
  duke-dependency-generator/
    SKILL.md          # generated: spec entrypoint (frontmatter + body + TOC into references/)
    README.md
    metadata.json     # source: frontmatter fields, body, abstract, citations
    AGENTS.md         # generated: long-form fallback for the AGENTS.md convention
    references/
      _sections.md    # source: section ordering, impact, descriptions
      _template.md    # source: per-reference authoring template
      *.md            # source: individual references (frontmatter + bad/good examples)
```

Per the [open Agent Skills specification](https://agentskills.io/specification#optional-directories), `references/` is the canonical name for runtime-loadable docs. The agent loads `SKILL.md` on activation; individual `references/*.md` files load on demand when the TOC points to them. `AGENTS.md` is the universal fallback for the [23+ tools that follow the AGENTS.md convention](https://agents.md) without skill awareness.

## Build Layout

```text
packages/
  skills-build/
    package.json
    tsconfig.json
    src/
      build.ts          # compiles references/ → SKILL.md + AGENTS.md
      validate.ts       # checks per-reference structure (title, examples, impact, bad/good pair)
      parser.ts         # parses per-reference frontmatter, body, examples, citations
      extract-tests.ts  # extracts bad/good code examples to JSON for downstream tooling
      config.ts         # SKILLS registry
      types.ts          # shared TypeScript types
```

A single build package compiles every skill in this repo. Skills are registered in `src/config.ts` via the `SKILLS` record.

## CI Contract

- CI triggers only when a skill or the shared build package changes.
- CI runs from `packages/skills-build` as the working directory.
- Required checks per skill: `pnpm validate:<skill>` and `pnpm build:<skill>`.
- After build, CI verifies the working tree is clean — if `SKILL.md`, `AGENTS.md`, or test-cases JSON drifted from the source `references/`, the build fails.

## Authoring

- Each `references/*.md` must include frontmatter, an explanation, and a bad/good code example pair.
- References are grouped by filename prefix; section ordering, impact, and descriptions live in `references/_sections.md`.
- `SKILL.md` and `AGENTS.md` inside each skill are generated; do not hand-edit them.
- `metadata.json` is the source of truth for skill-level fields (`name`, `description`, `license`, `allowedTools`, `author`, `version`, `body`, `abstract`).

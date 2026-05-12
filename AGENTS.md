# AGENTS.md

This repository stores reusable agent skills and deterministic build pipelines.

## Skill Layout

```text
skills/
  duke-dependency-generator/
    SKILL.md
    README.md
    metadata.json
    AGENTS.md
    rules/
      _sections.md
      _template.md
      *.md
```

## Build Layout

```text
packages/
  skills-build/
    package.json
    tsconfig.json
    src/
      build.ts
      validate.ts
      parser.ts
      extract-tests.ts
      config.ts
      types.ts
```

A single build package compiles every skill in this repo. Skills are registered in `src/config.ts` via the `SKILLS` record.

## CI Contract

- CI triggers only when a skill or the shared build package changes.
- CI runs from `packages/skills-build` as the working directory.
- Required checks per skill: `pnpm validate:<skill>` and `pnpm build:<skill>`.

## Authoring Rules

- Each rule file must include frontmatter, explanation, and bad/good examples.
- Rules are grouped by prefix and section metadata in `rules/_sections.md`.
- `AGENTS.md` inside a skill is generated from source rules; do not hand-edit it.

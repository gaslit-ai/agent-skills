# Duke Dependency Generator

A structured skill for creating deterministic architecture and dependency graph workflows in TypeScript repositories.

## Structure

- `references/` - source references (one file per reference; loaded on demand)
- `metadata.json` - skill-level metadata (name, description, license, body, citations)
- `SKILL.md` - generated: spec entrypoint with TOC linking into `references/`
- `AGENTS.md` - generated: long-form fallback for the AGENTS.md convention

## Getting Started

1. Install required analysis libraries:
   ```bash
   npm install --save-dev dependency-cruiser ts-morph fast-glob
   ```
2. Initialize dependency-cruiser in the target repository:
   ```bash
   npx depcruise --init oneshot
   ```
3. Implement and run your arch command:
   ```bash
   npm run arch -- --help
   ```
4. Validate repeatability:
   ```bash
   npm run arch -- --deps --minify false > /tmp/deps1.mmd
   npm run arch -- --deps --minify false > /tmp/deps2.mmd
   diff /tmp/deps1.mmd /tmp/deps2.mmd
   ```

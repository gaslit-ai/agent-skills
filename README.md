# Agent Skills

A collection of AI-agent skills with deterministic build tooling and CI validation.

## Available Skills

### duke-dependency-generator

Dependency and architecture graph generation playbook for TypeScript repositories. Use this when implementing or upgrading `npm run arch` style workflows with `dependency-cruiser`, `ts-morph`, and `fast-glob`.

### rfc

Unified RFC section-mapping skill for implementation and QA citation work across:
- RFC 9110 HTTP Semantics
- RFC 9700 OAuth 2.0 Security BCP

## Repository Architecture

- `skills/<skill>/` - skill source and generated outputs
- `packages/<skill>-build/` - build/validate/extract tooling for rule compilation
- `.github/workflows/` - path-scoped CI for each skill/tooling package

## Local Workflow

```bash
cd packages/skills-build
pnpm install
pnpm validate:all
pnpm build:all
```

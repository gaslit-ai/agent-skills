---
title: Seed Callgraph from Real Ingress Entrypoints
impact: HIGH
tags: callgraph, entrypoints, signal
---

## Seed Callgraph from Real Ingress Entrypoints

Choose entrypoints that represent real runtime ingress (API handlers, server bootstrap, CLI main). Arbitrary seeds create noisy, low-value graphs.

**Incorrect (random seed files):**

```bash
npm run arch -- --callgraph --entry "src/**/*.ts"
```

**Correct (explicit ingress seeds):**

```bash
npm run arch -- --callgraph --entry src/index.ts --entry src/server.ts
```

Reference: [TypeScript program modeling](https://www.typescriptlang.org/)

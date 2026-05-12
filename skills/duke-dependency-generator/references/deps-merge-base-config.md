---
title: Merge Mermaid Output Options with Generated depcruise Config
impact: HIGH
tags: deps, depcruise, mermaid
---

## Merge Mermaid Output Options with Generated depcruise Config

Custom graph output should extend generated dependency-cruiser config, not replace it, to preserve repository-specific resolver behavior.

**Incorrect (replace baseline resolver):**

```js
const config = { outputType: "mermaid" }
```

**Correct (merge with baseline):**

```js
const config = {
  ...baseConfig,
  outputType: "mermaid",
  reporterOptions: {
    ...(baseConfig.reporterOptions ?? {}),
    dot: { ...(baseConfig.reporterOptions?.dot ?? {}), collapsePattern: "node_modules" }
  }
}
```

Reference: [dependency-cruiser configuration](https://github.com/sverweij/dependency-cruiser)

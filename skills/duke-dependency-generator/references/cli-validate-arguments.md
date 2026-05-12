---
title: Validate CLI Arguments Before Execution
impact: HIGH
tags: cli, validation, ergonomics
---

## Validate CLI Arguments Before Execution

Reject missing values and incompatible flags early to avoid accidental graph generation with the wrong mode.

**Incorrect (silent argument swallowing):**

```bash
npm run arch -- --config --deps
# --deps is consumed as config value
```

**Correct (explicit validation and failure):**

```bash
npm run arch -- --config --deps
# exits with: Missing value for --config. Expected a path.
```

Reference: [Node.js process args](https://nodejs.org/docs/latest-v20.x/api/process.html#processargv)

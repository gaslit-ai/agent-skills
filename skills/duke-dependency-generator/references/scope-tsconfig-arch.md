---
title: Use a Dedicated tsconfig.arch.json for Analysis Scope
impact: CRITICAL
tags: scope, tsconfig, deterministic
---

## Use a Dedicated tsconfig.arch.json for Analysis Scope

Architecture analysis should run in a dedicated TS project so test/build artifacts and generated files do not pollute graph output.

**Incorrect (reusing app tsconfig pulls too much):**

```json
{
  "extends": "./tsconfig.json"
}
```

**Correct (explicit analysis scope):**

```json
{
  "extends": "./tsconfig.json",
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["dist", "build", "coverage", "**/*.test.ts", "**/*.spec.ts"]
}
```

Reference: [TSConfig reference](https://www.typescriptlang.org/tsconfig/)

---
title: Keep Type Graph IDs and Ordering Deterministic
impact: HIGH
tags: types, ts-morph, determinism
---

## Keep Type Graph IDs and Ordering Deterministic

Sort declaration sources and assign stable node IDs so reruns produce clean diffs and CI can detect real graph changes.

**Incorrect (iteration-order dependent IDs):**

```ts
for (const declaration of declarations) {
  nodes.push({ id: Math.random().toString(), label: declaration.getName() })
}
```

**Correct (stable sort and deterministic IDs):**

```ts
for (const declaration of declarations
  .slice()
  .sort((a, b) => a.getSourceFile().getFilePath().localeCompare(b.getSourceFile().getFilePath(), "en-US"))) {
  const id = declaration.getSourceFile().getFilePath() + "::" + declaration.getName()
  nodes.push({ id, label: declaration.getName() ?? "anonymous" })
}
```

Reference: [ts-morph docs](https://ts-morph.com/)

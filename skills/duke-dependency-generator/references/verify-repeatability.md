---
title: Prove Repeatability with Diff-Based Re-Runs
impact: MEDIUM
tags: verify, determinism, ci
---

## Prove Repeatability with Diff-Based Re-Runs

Every graph mode should produce stable output across consecutive runs. This is required for trustworthy reviews and CI drift detection.

**Incorrect (single-run confidence only):**

```bash
npm run arch -- --deps
```

**Correct (repeat and diff):**

```bash
npm run arch -- --deps --minify false > /tmp/deps-1.mmd
npm run arch -- --deps --minify false > /tmp/deps-2.mmd
diff /tmp/deps-1.mmd /tmp/deps-2.mmd
```

Reference: [POSIX diff](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/diff.html)

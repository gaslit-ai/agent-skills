---
title: Install Required Analysis Libraries Before Any Init Step
impact: CRITICAL
tags: bootstrap, install, dependency-cruiser, ts-morph, fast-glob
---

## Install Required Analysis Libraries Before Any Init Step

`dependency-cruiser`, `ts-morph`, and `fast-glob` are hard requirements for this architecture workflow. Install them before initialization or wrapper scripts.

**Incorrect (partial setup causes failure):**

```bash
npm install --save-dev dependency-cruiser
npx depcruise --init oneshot
npm run arch
```

**Correct (full install first):**

```bash
npm install --save-dev dependency-cruiser ts-morph fast-glob
npx depcruise --init oneshot
npm run arch -- --help
```

Reference: [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)

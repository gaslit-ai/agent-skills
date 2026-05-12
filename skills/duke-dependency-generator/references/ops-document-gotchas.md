---
title: Keep a Living GOTCHA Log for Recurring Failure Modes
impact: MEDIUM
tags: ops, gotchas, docs
---

## Keep a Living GOTCHA Log for Recurring Failure Modes

When setup or output behaves unexpectedly, document the trap in repo docs so future implementations avoid rediscovering it.

**Incorrect (tribal knowledge only):**

```text
Team members repeatedly hit zsh globbing, entrypoint explosion, and npm preamble parsing issues.
```

**Correct (capture gotchas immediately):**

```markdown
## GOTCHAs
- zsh expands unquoted globs; quote file patterns.
- npm command output includes preamble lines; parse graph sections explicitly.
- broad callgraph entrypoints can exceed max edge budgets.
```

Reference: [GitHub Markdown](https://docs.github.com/en/get-started/writing-on-github)

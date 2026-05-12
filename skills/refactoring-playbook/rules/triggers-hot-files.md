---
title: Prioritize Files With High Relative Churn (Top-Decile Hotspots)
impact: CRITICAL
tags: triggers, churn, hotspots, defect-prediction
---

## Prioritize Files With High Relative Churn (Top-Decile Hotspots)

Relative-churn is among the most reliably-validated process metrics for prioritizing maintenance. Nagappan & Ball's ICSE 2005 logistic-regression study attained 89.0% classification accuracy discriminating fault-prone from non-fault-prone binaries on Windows Server 2003 using relative-churn predictors; Pantiuchina et al. (TOSEM 2020) mined 287,813 refactoring operations across 150 systems and found prior-change frequency is a strong correlate of where developer-initiated refactoring concentrates; behavioral-code-analysis (Tornhill, *Your Code as a Crime Scene*) further quantifies a Pareto regime where ~1–2% of files typically account for ~70% of edit activity, with defects clustering in the same subset. The merge-cost of restructuring a rarely-edited file rarely amortizes; restructuring a top-decile hotspot pays back on the next feature touching it.

**Incorrect (refactoring a low-churn legacy helper — defect risk and ROI are both negligible):**

```bash
# legacy/format-1999.ts: 1 commit in 24 months
git log --since="24 months ago" --pretty=oneline -- legacy/format-1999.ts
# a1b2c3d  fix typo in comment

# yet the file gets a 400-line "modernization" PR
```

**Correct (relative-churn ranking surfaces hotspots; refactor the top-decile target):**

```bash
# rank by edit frequency over a 90-day window (relative churn proxy)
git log --since="90 days ago" --pretty=format: --name-only \
  | grep -v '^$' | sort | uniq -c | sort -rn | head
#   18 api/orders.ts        <-- top-decile hotspot
#   12 api/payments.ts
#    9 web/checkout.tsx
#    2 legacy/format-1999.ts

# augment with lines-touched (severity of churn) before committing scope
git log --since="90 days ago" --numstat -- api/orders.ts \
  | awk 'NF==3 {add+=$1; del+=$2} END {print "+"add, "-"del}'
# +812 -640    <-- high relative churn, well above repo median
```

References:
- [Nagappan & Ball (2005) — Use of Relative Code Churn Measures to Predict System Defect Density, ICSE](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/icse05churn.pdf)
- [Pantiuchina et al. (2020) — Why Developers Refactor Source Code, TOSEM](https://arxiv.org/pdf/2101.01430)
- [Tornhill — Your Code as a Crime Scene (2nd ed., Pragmatic Bookshelf)](https://pragprog.com/titles/atcrime2/your-code-as-a-crime-scene-second-edition/)

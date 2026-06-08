---
title: Forbid Import Cycles and Publish Module Surfaces via Explicit Index Files
impact: CRITICAL
tags: graph, imports, cycles, module-surfaces, barrel-files
---

## Forbid Import Cycles and Publish Module Surfaces via Explicit Index Files

**Impact: CRITICAL**

GraphCoder (ASE 2024) demonstrates that retrieval over a control-flow plus data-dependence Code Context Graph outperforms sequence-based retrieval by a wide margin — but only when the graph is well-formed. Import cycles, deep relative paths (`../../../utils/...`), and wildcard re-exports collapse the graph back into a flat soup that the agent must re-parse. AutoCodeRover (ISSTA 2024) reaches 46.2% on SWE-bench Verified specifically by searching via classes and methods rather than text, which requires that each module expose a typed surface. Long Code Arena (JetBrains 2024) shows that even when the relevant context fits in the model's context window, agents fail to locate it in repos where the module surface is implicit — the agent cannot scan an `index.ts` it does not exist. Cycles, in particular, are corrosive: they make the dependency relation symmetric where it should be a partial order, which destroys the hierarchical-localization signal the agent depends on.

**Incorrect (cycle + deep relative imports + unbounded re-exports):**

```ts
// src/services/billing/billing.service.ts
import { IdentityService } from '../../identity/identity.service';
// src/services/identity/identity.service.ts
import { BillingService } from '../../billing/billing.service';  // <-- cycle

// src/utils/index.ts
export * from '../services/billing/billing.repository';  // leaks internals
export * from '../services/identity/identity.repository';
```

**Correct (acyclic deps via shared domain layer; each module exposes only its public surface):**

```ts
// src/domain/legal-party/index.ts — typed surface, nothing else exposed
export type { LegalParty, LegalPartyId } from './legal-party.types';
export { createLegalParty, isLegalParty } from './legal-party';

// src/services/billing/index.ts
export type { BillingProfile } from './billing.types';
export { BillingService } from './billing.service';

// src/services/billing/billing.service.ts
import type { LegalPartyId } from '@/domain/legal-party';
// note: no import from identity; both depend on domain, not on each other.

// src/services/identity/index.ts
export type { AuthenticationProfile } from './identity.types';
export { IdentityService } from './identity.service';
```

References:
- [Liu et al. — GraphCoder: Enhancing Repository-Level Code Completion via Coarse-to-fine Retrieval (ASE 2024)](https://arxiv.org/abs/2406.07003)
- [Zhang et al. — AutoCodeRover: Autonomous Program Improvement (ISSTA 2024)](https://arxiv.org/abs/2404.05427)
- [Bogomolov et al. — Long Code Arena](https://arxiv.org/abs/2406.11612)
- [Ouyang et al. — RepoGraph (ICLR 2025)](https://arxiv.org/abs/2410.14684)
- [Zhang et al. — RepoCoder: Repository-Level Code Completion (EMNLP 2023)](https://arxiv.org/abs/2303.12570)

---
title: Modularize the Ontology Around Stable Interface Boundaries
impact: HIGH
tags: architecture, modularity, imports, bounded-contexts, maintenance
---

## Modularize the Ontology Around Stable Interface Boundaries

Cuenca Grau, Horrocks, Kazakov & Sattler (2008) formalize ontology modules with locality-based extraction guaranteeing that an importer reasons over exactly the entailments it depends on and no more; Stuckenschmidt, Parent & Spaccapietra (2009) treat modularity as the engineering response to monolithic reasoning, import, change-propagation, and reuse cost; Rector, Brandt, Drummond & Horridge (2011) document use-cases — change containment, parallel development, scoped reasoning, safe extraction — that justify modular decomposition in OWL; Pathak, Johnson & Chute (2009) survey biomedical modularization techniques showing measurable gains in load time and reasoning latency; Stuckenschmidt & Klein and d'Aquin et al. extend this to reasoning under change and knowledge selection. A monolithic shared ontology forces every importer to absorb the entire conceptualization plus its reasoning cost and review surface; modules with explicit imports and stable interfaces let services depend on exactly the slice they actually use.

**Incorrect (every service imports the whole enterprise ontology — every change to any unrelated term ripples through every consumer):**

```ts
import { EnterpriseOntology } from "@acme/ontology/all";

const term = EnterpriseOntology.anything.CustomerLifecycleState;
```

**Correct (service imports only the stable, versioned modules it depends on — change containment is structural, not aspirational):**

```ts
import { CustomerCore } from "@acme/ontology/customer-core/v2";
import { AccountRelations } from "@acme/ontology/account-relations/v1";

export const requiredOntologyModules = [
  CustomerCore.moduleIri,
  AccountRelations.moduleIri
] as const;
```

References:
- [Cuenca Grau, Horrocks, Kazakov & Sattler (2008) — Modular Reuse of Ontologies: Theory and Practice](https://www.researchgate.net/publication/220543139_Modular_Reuse_of_Ontologies_Theory_and_Practice)
- [Stuckenschmidt, Parent & Spaccapietra (2009) — Modular Ontologies: Concepts, Theories and Techniques for Knowledge Modularization](https://link.springer.com/book/10.1007/978-3-642-01907-4)
- [Rector, Brandt, Drummond & Horridge (2011) — Engineering Use Cases for Modular Development of Ontologies in OWL](https://www.researchgate.net/publication/262175610_Engineering_use_cases_for_modular_development_of_ontologies_in_OWL)
- [Pathak, Johnson & Chute (2009) — Survey of Modular Ontology Techniques and Their Applications in the Biomedical Domain](https://journals.sagepub.com/doi/pdf/10.3233/ICA-2009-0315)
- [Stuckenschmidt & Klein — Reasoning and Change Management in Modular Ontologies](https://research.vu.nl/en/publications/reasoning-and-change-management-in-modular-ontologies/)
- [d'Aquin, Schlicht, Stuckenschmidt & Sabou — Ontology Modularization for Knowledge Selection](https://www.researchgate.net/publication/221464995_Ontology_Modularization_for_Knowledge_Selection_Experiments_and_Evaluations)

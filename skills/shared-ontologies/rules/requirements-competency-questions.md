---
title: Start Shared Ontologies From Competency Questions, Not Term Lists
impact: CRITICAL
tags: requirements, competency-questions, scope, ontology-engineering
---

## Start Shared Ontologies From Competency Questions, Not Term Lists

Before a shared ontology enters a codebase, express its purpose as competency questions (CQs), motivating scenarios, intended users, intended uses, scope, and expected granularity. Grüninger & Fox (1995) introduced CQs as informal requirements that subsequently become formal entailment targets the ontology must answer; Noy & McGuinness's *Ontology Development 101* (2001) and the METHONTOLOGY (Fernández-López et al. 1997), NeOn (Suárez-Figueroa, Gómez-Pérez & Fernández-López 2015), and Ontology Requirements Specification Document (Suárez-Figueroa, Gómez-Pérez & Villazón-Terrazas 2012) frameworks each treat the requirements artefact — domain, purpose, intended users, CQs, pre-glossary — as the agreement boundary between domain experts and engineers and the evaluation oracle for the resulting ontology. Term-first vocabularies cannot be evaluated for fitness (no entailment to test against), cannot be scoped (no exclusion criteria), and routinely collapse under stakeholder disagreement because no question pins what each term must support.

**Incorrect (a vocabulary dump — no user, no task, no query, no verification target):**

```ts
export const ontologyTerms = [
  "Customer",
  "Account",
  "Identity",
  "Entitlement",
  "Segment"
] as const;
```

**Correct (competency questions, scope, and intended consumers fix the verification target up front):**

```ts
export const competencyQuestions = [
  {
    id: "CQ-001",
    asks: "Which legal party owns this account at a given effective time?",
    requiredTerms: ["LegalParty", "Account", "owns", "effectiveTime"],
    expectedQuery: "account.owner.where(effectiveTime <= t)"
  }
] as const;

export const ontologyScope = {
  domain: "customer-account ownership",
  excluded: ["marketing segmentation", "credit underwriting"],
  intendedUsers: ["billing-service", "identity-service", "compliance-reporting"]
} as const;
```

References:
- [Gruber (1995) — Toward Principles for the Design of Ontologies Used for Knowledge Sharing](https://www.sciencedirect.com/science/article/pii/S1071581985710816)
- [Grüninger & Fox (1995) — The Role of Competency Questions in Enterprise Engineering](https://www.researchgate.net/publication/2653385_The_Role_of_Competency_Questions_in_Enterprise_Engineering)
- [Noy & McGuinness (2001) — Ontology Development 101](https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html)
- [Fernández-López, Gómez-Pérez & Juristo (1997) — METHONTOLOGY: From Ontological Art Towards Ontological Engineering](https://aaai.org/papers/0005-ss97-06-005-methontology-from-ontological-art-towards-ontological-engineering/)
- [Suárez-Figueroa, Gómez-Pérez & Villazón-Terrazas (2012) — How to Write and Use the Ontology Requirements Specification Document](https://www.researchgate.net/publication/220830640_How_to_Write_and_Use_the_Ontology_Requirements_Specification_Document)
- [Suárez-Figueroa, Gómez-Pérez & Fernández-López (2015) — The NeOn Methodology Framework](https://journals.sagepub.com/doi/abs/10.3233/AO-150145)

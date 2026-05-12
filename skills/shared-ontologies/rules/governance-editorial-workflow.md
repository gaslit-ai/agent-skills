---
title: Govern Shared Ontologies With Collaborative Editorial Workflow
impact: HIGH
tags: governance, collaboration, review, editorial-workflow, domain-experts
---

## Govern Shared Ontologies With Collaborative Editorial Workflow

A shared ontology encodes social agreement among stakeholders; solo edits create local truth masquerading as enterprise truth. Simperl & Luczak-Rösch's collaborative-ontology-engineering survey (KER 2014) shows empirically that community-driven, workflow-managed change is the sustainable maintenance model; WebProtégé (Tudorache, Nyulas, Noy & Musen 2013; Horridge et al. 2019) demonstrates production deployment of role-based collaborative editing with discussion threads, change proposals, and review; Holsapple & Joshi (CACM 2002) frame ontology design as a collaborative process gated by structured domain-expert input; Palma et al. (2011) treat change management as the integrating mechanism for distributed ontology development; the NeOn methodology (Suárez-Figueroa et al. 2015) and the OBO Foundry's editorial process (Smith et al. 2007) operationalize roles, proposals, and decision records as the apparatus that converts disagreement into versioned change. Without a workflow, the ontology becomes whatever the last engineer to push believed it should be — at which point it stops being a shared contract.

**Incorrect (developer-local semantic authority — no domain expert, no review, no decision record):**

```ts
await ontologyRepo.merge({
  author: "backend-dev",
  change: "rename Party to Customer because it sounds clearer",
  reviewers: []
});
```

**Correct (proposal references the affected terms and CQs, names the required reviewers, and produces a decision record):**

```ts
await ontologyRepo.proposeChange({
  changeId: "ONT-742",
  affectedTerms: ["Party", "Customer"],
  competencyQuestions: ["CQ-001", "CQ-017"],
  reviewers: ["domain-owner", "data-architect", "service-owner"],
  decisionRecord: "ADR-ontology-742-party-customer-boundary"
});
```

References:
- [Simperl & Luczak-Rösch (2014) — Collaborative Ontology Engineering: A Survey](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0269888913000192)
- [Tudorache, Nyulas, Noy & Musen (2013) — WebProtégé: A Collaborative Ontology Editor and Knowledge Acquisition Tool](https://journals.sagepub.com/doi/10.3233/SW-2012-0057)
- [Horridge et al. (2019) — WebProtégé: A Cloud-Based Ontology Editor](https://www.researchgate.net/publication/333075611_WebProtege_A_Cloud-Based_Ontology_Editor)
- [Holsapple & Joshi (2002) — A Collaborative Approach to Ontology Design](https://cacm.acm.org/research/a-collaborative-approach-to-ontology-design/)
- [Palma et al. (2011) — A Holistic Approach to Collaborative Ontology Development Based on Change Management](https://www.sciencedirect.com/science/article/abs/pii/S1570826811000503)
- [Suárez-Figueroa, Gómez-Pérez & Fernández-López (2015) — The NeOn Methodology Framework](https://journals.sagepub.com/doi/abs/10.3233/AO-150145)
- [Smith et al. (2007) — The OBO Foundry](https://www.nature.com/articles/nbt1346)

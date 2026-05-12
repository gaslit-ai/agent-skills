---
title: Version Ontology Changes as Contract Migrations
impact: CRITICAL
tags: evolution, versioning, provenance, migration, deprecation
---

## Version Ontology Changes as Contract Migrations

Ontology changes affect data, APIs, queries, generated code, annotations, reasoning results, and downstream integrations — every artefact that committed to the prior conceptualization. Klein & Fensel (2001) frame versioning on the Semantic Web as the explicit management of relations between revisions; Noy & Musen (2004) define change-detection and merging operations within an ontology-management framework; Stojanovic, Stojanovic & Handschuh (2002) treat ontology evolution as a six-phase process from change capture through verification; Flouris et al.'s "Ontology Change: Classification and Survey" (2008) and Zablith et al.'s process-centric survey (2015) classify change kinds and trace the evolution lifecycle; PAV (Ciccarese et al. 2013) standardizes provenance, authoring, and versioning metadata reused across biomedical ontologies; Maedche, Motik & Stojanovic (2003) address distributed ontology management across multiple linked versions. Silently mutating a published term — same IRI, redefined meaning — is a breaking change to every consumer whose data, code, or query committed to its prior interpretation.

**Incorrect (silent semantic mutation — same IRI, redefined meaning, no migration, no deprecation, no provenance):**

```ts
export const Customer = {
  iri: "https://acme.example/ontology#Customer",
  definition: "A person who logs into the application."
};
```

**Correct (new version IRI, prior version explicitly deprecated, migration rule documented, provenance preserved):**

```ts
export const Customer_v2 = {
  iri: "https://acme.example/ontology/v2#Customer",
  definition: "A legal party with an accountable commercial relationship.",
  replaces: "https://acme.example/ontology/v1#Customer",
  migration: "map v1 Customer where kind=person to v2 NaturalPersonCustomer",
  deprecatedTerms: ["https://acme.example/ontology/v1#Customer"]
};
```

References:
- [Klein & Fensel (2001) — Ontology Versioning on the Semantic Web](https://www.researchgate.net/publication/2377424_Ontology_versioning_on_the_Semantic_Web)
- [Noy & Musen (2004) — Ontology Versioning in an Ontology Management Framework](https://www.researchgate.net/publication/3454215_Ontology_versioning_in_an_ontology_management_framework)
- [Stojanovic, Stojanovic & Handschuh (2002) — Evolution in Ontology-Based Knowledge Management Systems](https://aisel.aisnet.org/ecis2002/123/)
- [Flouris et al. (2008) — Ontology Change: Classification and Survey](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/EEF2FB377B9125CBB784E6F1B6853404/S0269888908001367a.pdf/ontology-change-classification-and-survey.pdf)
- [Zablith et al. (2015) — Ontology Evolution: A Process-Centric Survey](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/CE4387A954917B7CA3282CE25FAC09FA/S0269888913000349a.pdf/ontology-evolution-a-process-centric-survey.pdf)
- [Ciccarese et al. (2013) — PAV Ontology: Provenance, Authoring and Versioning](https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-4-37)
- [Maedche, Motik & Stojanovic — Managing Multiple and Distributed Ontologies on the Semantic Web](https://research.manchester.ac.uk/en/publications/managing-multiple-and-distributed-ontologies-on-the-semantic-web)

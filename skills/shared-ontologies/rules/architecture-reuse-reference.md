---
title: Reuse Reference Ontologies Before Inventing Local Synonyms
impact: HIGH
tags: architecture, reuse, reference-ontology, foundational-ontology, ontology-design-patterns
---

## Reuse Reference Ontologies Before Inventing Local Synonyms

When a term already exists in a dependable domain, upper, or reference ontology, reuse or reference it rather than mint a local synonym. The OBO Foundry (Smith et al. 2007) and the Gene Ontology (Ashburner et al. 2000) demonstrate at scale that coordinated, non-redundant reuse of reference terms across hundreds of contributors is the mechanism by which integration becomes tractable; MIREOT (Courtot et al. 2011) operationalizes the minimum metadata for importing external terms into a local ontology; Ontology Design Patterns (Gangemi 2005; Gangemi & Presutti 2009) capture reusable modelling fragments derived from recurring conceptualization problems; DOLCE (Borgo et al. 2022) and BFO (Otte, Beverley & Ruttenberg 2022) provide upper-level distinctions (continuant vs. occurrent, dependent vs. independent) whose alignment dramatically lowers integration cost. Local synonyms minted in ignorance of these references create silent disagreement at every downstream interface — exactly the integration tax reference ontologies exist to remove.

**Incorrect (local synonym invented without checking reusable reference vocabularies):**

```ts
export const CellPart = {
  iri: "https://acme.example/ontology#CellPart",
  definition: "Something inside a biological cell."
};
```

**Correct (Gene Ontology term referenced via MIREOT-style import, with explicit local alias preserved for tooling):**

```ts
export const referencedTerms = {
  cellularComponent: {
    iri: "http://purl.obolibrary.org/obo/GO_0005575",
    source: "Gene Ontology",
    localAlias: "CellularComponent"
  }
} as const;

export const assayOntology = {
  imports: [referencedTerms.cellularComponent.iri],
  localTerms: ["AcmeAssayRun", "AcmeSamplePreparation"]
} as const;
```

References:
- [Smith et al. (2007) — The OBO Foundry: Coordinated Evolution of Ontologies to Support Biomedical Data Integration](https://www.nature.com/articles/nbt1346)
- [Ashburner et al. (2000) — Gene Ontology: Tool for the Unification of Biology](https://www.nature.com/articles/ng0500_25)
- [Courtot et al. (2011) — MIREOT: The Minimum Information to Reference an External Ontology Term](https://journals.sagepub.com/doi/10.3233/AO-2011-0087)
- [Gangemi (2005) — Ontology Design Patterns for Semantic Web Content](https://www.researchgate.net/publication/221466152_Ontology_Design_Patterns_for_Semantic_Web_Content)
- [Gangemi & Presutti (2009) — Ontology Design Patterns](https://www.researchgate.net/publication/227215903_Ontology_Design_Patterns)
- [Borgo et al. (2022) — DOLCE: A Descriptive Ontology for Linguistic and Cognitive Engineering](https://journals.sagepub.com/doi/10.3233/AO-210259)
- [Otte, Beverley & Ruttenberg (2022) — BFO: Basic Formal Ontology](https://journals.sagepub.com/doi/10.3233/AO-220262)

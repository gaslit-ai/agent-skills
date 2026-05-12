---
title: Measure Ontology Value by Operational Use, Not Aesthetic Completeness
impact: MEDIUM
tags: governance, measurement, adoption, queryability, data-quality
---

## Measure Ontology Value by Operational Use, Not Aesthetic Completeness

Judge a shared ontology by observable software and data outcomes — annotation coverage, CQ pass rate, queryable integrations, mapping reuse, data-validation pass rate, removed adapter logic, and downstream adoption — not by term count or taxonomic elegance. The Gene Ontology (Ashburner et al. 2000) and the OBO Foundry (Smith et al. 2007) are measured in practice by annotated entity coverage and cross-resource interoperability in production biology; Wache et al. (2001) evaluate ontology-based integration by what it actually queries; the Statoil OBDA deployment (Kharlamov et al. 2017) reports operational metrics — query latency, business-user query authorship rate — as the measure of fit; Corcho, Priyatna & Chaves-Fraga (2020) survey OBDA in production with the same operational orientation; software-engineering ontology literature (Calero, Ruiz & Piattini 2006; Happel & Seedorf 2006) and linked-data quality testing (Kontokostas et al. 2014) evaluate ontologies by the outcomes they enable rather than by curated term counts. Vanity metrics reward growth that nobody consumes.

**Incorrect (vanity metric — counts terms, not whether anyone can use them):**

```ts
const ontologyScore = ontology.terms.length;
```

**Correct (portfolio of operational outcomes the ontology is supposed to enable, each tied to a downstream consumer):**

```ts
const ontologyScore = {
  competencyQuestionsPassing: 42 / 44,
  productionEventsAnnotated: 0.91,
  mappingsReusedAcrossServices: 18,
  shaclValidationPassRate: 0.987,
  adapterBranchesRemoved: 37
};
```

References:
- [Ashburner et al. (2000) — Gene Ontology: Tool for the Unification of Biology](https://www.nature.com/articles/ng0500_25)
- [Smith et al. (2007) — The OBO Foundry](https://www.nature.com/articles/nbt1346)
- [Wache et al. (2001) — Ontology-Based Integration of Information](https://www.researchgate.net/publication/200122923_Ontology-based_integration_of_information_---_a_survey_of_existing_approaches)
- [Kharlamov et al. (2017) — Ontology Based Data Access in Statoil](https://www.sciencedirect.com/science/article/pii/S1570826817300276)
- [Corcho, Priyatna & Chaves-Fraga (2020) — Towards a New Generation of Ontology-Based Data Access](https://journals.sagepub.com/doi/10.3233/SW-190384)
- [Calero, Ruiz & Piattini (2006) — Ontologies for Software Engineering and Software Technology](https://link.springer.com/book/10.1007/3-540-34518-3)
- [Happel & Seedorf (2006) — Applications of Ontologies in Software Engineering](https://www.researchgate.net/publication/228386661_Applications_of_ontologies_in_software_engineering)
- [Kontokostas et al. (2014) — Test-Driven Evaluation of Linked Data Quality](https://www.researchgate.net/publication/259828947_Test-driven_Evaluation_of_Linked_Data_Quality)

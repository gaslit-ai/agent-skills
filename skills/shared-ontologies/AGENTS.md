# Shared Ontologies

**Version 0.1.0**  
Duke Engineering  
May 2026

> **Note:**  
> This guide is optimized for agents and AI-assisted engineering workflows.
> It prioritizes deterministic behavior, explicit contracts, and maintainable defaults.

---

## Abstract

Evidence-based playbook for shared ontologies in software systems. Synthesizes 50+ peer-reviewed or canonical sources from ontology engineering (Gruber; Grüninger & Fox; METHONTOLOGY; NeOn; Ontology Requirements Specification), semantic web standards (OWL 2 profiles, OBDA, SHACL/ShEx), software-engineering ontology literature, biomedical ontology infrastructure (OBO Foundry, Gene Ontology, MIREOT), upper ontologies (DOLCE, BFO), modularity research, ontology evaluation (OntoClean, OOPS!, RDFUnit), ontology evolution and versioning (PAV, Flouris, Zablith), schema and ontology matching (Rahm & Bernstein; Euzenat & Shvaiko), and collaborative ontology engineering (WebProtégé, NeOn governance) into a small set of high-leverage rules covering requirements, architecture, validation, evolution, and governance.

---

## Table of Contents

1. [Requirements — Purpose, Scope, and Contract](#1-requirements--purpose-scope-and-contract) — **CRITICAL**
   - 1.1 [Start Shared Ontologies From Competency Questions, Not Term Lists](#11-start-shared-ontologies-from-competency-questions-not-term-lists)
   - 1.2 [Treat the Shared Ontology as a Semantic Contract, Not a Naming Convention](#12-treat-the-shared-ontology-as-a-semantic-contract-not-a-naming-convention)
2. [Architecture — Reuse, Modularity, and Expressivity](#2-architecture--reuse-modularity-and-expressivity) — **HIGH**
   - 2.1 [Modularize the Ontology Around Stable Interface Boundaries](#21-modularize-the-ontology-around-stable-interface-boundaries)
   - 2.2 [Reuse Reference Ontologies Before Inventing Local Synonyms](#22-reuse-reference-ontologies-before-inventing-local-synonyms)
   - 2.3 [Use the Weakest Formalism That Satisfies the Required Inference](#23-use-the-weakest-formalism-that-satisfies-the-required-inference)
3. [Validation — Release-Gate Checks](#3-validation--release-gate-checks) — **CRITICAL**
   - 3.1 [Validate Ontologies With Tests, Reasoners, Shapes, and Pitfall Scanners](#31-validate-ontologies-with-tests-reasoners-shapes-and-pitfall-scanners)
4. [Evolution — Versioning and Mappings](#4-evolution--versioning-and-mappings) — **CRITICAL**
   - 4.1 [Make Cross-Ontology Mappings First-Class Artifacts](#41-make-cross-ontology-mappings-first-class-artifacts)
   - 4.2 [Version Ontology Changes as Contract Migrations](#42-version-ontology-changes-as-contract-migrations)
5. [Governance — Editorial Workflow and Measurement](#5-governance--editorial-workflow-and-measurement) — **HIGH**
   - 5.1 [Govern Shared Ontologies With Collaborative Editorial Workflow](#51-govern-shared-ontologies-with-collaborative-editorial-workflow)
   - 5.2 [Measure Ontology Value by Operational Use, Not Aesthetic Completeness](#52-measure-ontology-value-by-operational-use-not-aesthetic-completeness)

---

## 1. Requirements — Purpose, Scope, and Contract

**Impact: CRITICAL**

A shared ontology becomes unbounded the moment it is treated as a list of preferred names. The ontology-engineering literature converges on two prerequisites before any term is minted: explicit competency questions and motivating scenarios that define the verification target, and explicit definitions, relations, and constraints that turn each term into a commitment rather than a label. Skip either and the ontology cannot be evaluated, scoped, or relied on at integration boundaries.

### 1.1 Start Shared Ontologies From Competency Questions, Not Term Lists

**Impact: CRITICAL**

Before a shared ontology enters a codebase, express its purpose as competency questions (CQs), motivating scenarios, intended users, intended uses, scope, and expected granularity. Grüninger & Fox (1995) introduced CQs as informal requirements that subsequently become formal entailment targets the ontology must answer; Noy & McGuinness's *Ontology Development 101* (2001) and the METHONTOLOGY (Fernández-López et al. 1997), NeOn (Suárez-Figueroa, Gómez-Pérez & Fernández-López 2015), and Ontology Requirements Specification Document (Suárez-Figueroa, Gómez-Pérez & Villazón-Terrazas 2012) frameworks each treat the requirements artefact — domain, purpose, intended users, CQs, pre-glossary — as the agreement boundary between domain experts and engineers and the evaluation oracle for the resulting ontology. Term-first vocabularies cannot be evaluated for fitness (no entailment to test against), cannot be scoped (no exclusion criteria), and routinely collapse under stakeholder disagreement because no question pins what each term must support.

**Incorrect: a vocabulary dump — no user, no task, no query, no verification target**

```ts
export const ontologyTerms = [
  "Customer",
  "Account",
  "Identity",
  "Entitlement",
  "Segment"
] as const;
```

**Correct: competency questions, scope, and intended consumers fix the verification target up front**

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

Reference: [https://www.sciencedirect.com/science/article/pii/S1071581985710816](https://www.sciencedirect.com/science/article/pii/S1071581985710816), [https://www.researchgate.net/publication/2653385_The_Role_of_Competency_Questions_in_Enterprise_Engineering](https://www.researchgate.net/publication/2653385_The_Role_of_Competency_Questions_in_Enterprise_Engineering), [https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html](https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html), [https://aaai.org/papers/0005-ss97-06-005-methontology-from-ontological-art-towards-ontological-engineering/](https://aaai.org/papers/0005-ss97-06-005-methontology-from-ontological-art-towards-ontological-engineering/), [https://www.researchgate.net/publication/220830640_How_to_Write_and_Use_the_Ontology_Requirements_Specification_Document](https://www.researchgate.net/publication/220830640_How_to_Write_and_Use_the_Ontology_Requirements_Specification_Document), [https://journals.sagepub.com/doi/abs/10.3233/AO-150145](https://journals.sagepub.com/doi/abs/10.3233/AO-150145)

### 1.2 Treat the Shared Ontology as a Semantic Contract, Not a Naming Convention

**Impact: CRITICAL**

Gruber's "A Translation Approach to Portable Ontology Specifications" (1993) defines an ontology as an explicit specification of a conceptualization — vocabulary, definitions, relations, axioms — that an agent commits to when sharing knowledge; Uschold & Grüninger (1996) generalize this to inter-agent agreement on representational vocabulary, not on choice of label. The software-engineering ontology literature (Calero, Ruiz & Piattini 2006; Ruiz & Hilera 2006; Happel & Seedorf 2006; Akerman & Tyree 2006) treats common terminology with explicit definitions, relations, and constraints as the prerequisite for reuse across stakeholders, models, and tools. A shared label without a definition, a broader/narrower relation, or a constraint is not a contract — it is a naming collision waiting to surface the first time two services with identical labels turn out to disagree on extension.

**Incorrect: same label, different semantics across services — no commitment, no contract**

```ts
type BillingCustomer = { id: string; customerType: "customer" };
type SupportCustomer = { id: string; customerType: "customer" };
// no shared definition: payer? user? legal party? contact?
```

**Correct: each term carries IRI, label, definition, and a broader-than relation — a commitment downstream consumers can reason about**

```ts
type OntologyTerm = {
  iri: string;
  label: string;
  definition: string;
  broader?: string;
};

export const LegalCustomer: OntologyTerm = {
  iri: "https://acme.example/ontology/customer#LegalCustomer",
  label: "Legal customer",
  definition:
    "A legal party that has entered into an accountable commercial relationship with Acme.",
  broader: "https://acme.example/ontology/party#LegalParty"
};
```

Reference: [https://tomgruber.org/writing/ontolingua-kaj-1993/](https://tomgruber.org/writing/ontolingua-kaj-1993/), [https://www.researchgate.net/publication/302937543_Ontologies_Principles_methods_and_applications](https://www.researchgate.net/publication/302937543_Ontologies_Principles_methods_and_applications), [https://link.springer.com/book/10.1007/3-540-34518-3](https://link.springer.com/book/10.1007/3-540-34518-3), [https://link.springer.com/chapter/10.1007/3-540-34518-3_2](https://link.springer.com/chapter/10.1007/3-540-34518-3_2), [https://www.researchgate.net/publication/228386661_Applications_of_ontologies_in_software_engineering](https://www.researchgate.net/publication/228386661_Applications_of_ontologies_in_software_engineering), [https://www.researchgate.net/publication/224101625_Using_ontology_to_support_development_of_software_architectures](https://www.researchgate.net/publication/224101625_Using_ontology_to_support_development_of_software_architectures)

---

## 2. Architecture — Reuse, Modularity, and Expressivity

**Impact: HIGH**

Architectural decisions — what to reuse from existing reference and upper ontologies, how to decompose into modules with stable interfaces, and which formalism to commit to — set the lifetime cost of the ontology. Monolithic vocabularies, locally-minted synonyms of well-known terms, and choosing a logic stronger than the required inference each create durable maintenance and reasoning overhead.

### 2.1 Modularize the Ontology Around Stable Interface Boundaries

**Impact: HIGH**

Cuenca Grau, Horrocks, Kazakov & Sattler (2008) formalize ontology modules with locality-based extraction guaranteeing that an importer reasons over exactly the entailments it depends on and no more; Stuckenschmidt, Parent & Spaccapietra (2009) treat modularity as the engineering response to monolithic reasoning, import, change-propagation, and reuse cost; Rector, Brandt, Drummond & Horridge (2011) document use-cases — change containment, parallel development, scoped reasoning, safe extraction — that justify modular decomposition in OWL; Pathak, Johnson & Chute (2009) survey biomedical modularization techniques showing measurable gains in load time and reasoning latency; Stuckenschmidt & Klein and d'Aquin et al. extend this to reasoning under change and knowledge selection. A monolithic shared ontology forces every importer to absorb the entire conceptualization plus its reasoning cost and review surface; modules with explicit imports and stable interfaces let services depend on exactly the slice they actually use.

**Incorrect: every service imports the whole enterprise ontology — every change to any unrelated term ripples through every consumer**

```ts
import { EnterpriseOntology } from "@acme/ontology/all";

const term = EnterpriseOntology.anything.CustomerLifecycleState;
```

**Correct: service imports only the stable, versioned modules it depends on — change containment is structural, not aspirational**

```ts
import { CustomerCore } from "@acme/ontology/customer-core/v2";
import { AccountRelations } from "@acme/ontology/account-relations/v1";

export const requiredOntologyModules = [
  CustomerCore.moduleIri,
  AccountRelations.moduleIri
] as const;
```

Reference: [https://www.researchgate.net/publication/220543139_Modular_Reuse_of_Ontologies_Theory_and_Practice](https://www.researchgate.net/publication/220543139_Modular_Reuse_of_Ontologies_Theory_and_Practice), [https://link.springer.com/book/10.1007/978-3-642-01907-4](https://link.springer.com/book/10.1007/978-3-642-01907-4), [https://www.researchgate.net/publication/262175610_Engineering_use_cases_for_modular_development_of_ontologies_in_OWL](https://www.researchgate.net/publication/262175610_Engineering_use_cases_for_modular_development_of_ontologies_in_OWL), [https://journals.sagepub.com/doi/pdf/10.3233/ICA-2009-0315](https://journals.sagepub.com/doi/pdf/10.3233/ICA-2009-0315), [https://research.vu.nl/en/publications/reasoning-and-change-management-in-modular-ontologies/](https://research.vu.nl/en/publications/reasoning-and-change-management-in-modular-ontologies/), [https://www.researchgate.net/publication/221464995_Ontology_Modularization_for_Knowledge_Selection_Experiments_and_Evaluations](https://www.researchgate.net/publication/221464995_Ontology_Modularization_for_Knowledge_Selection_Experiments_and_Evaluations)

### 2.2 Reuse Reference Ontologies Before Inventing Local Synonyms

**Impact: HIGH**

When a term already exists in a dependable domain, upper, or reference ontology, reuse or reference it rather than mint a local synonym. The OBO Foundry (Smith et al. 2007) and the Gene Ontology (Ashburner et al. 2000) demonstrate at scale that coordinated, non-redundant reuse of reference terms across hundreds of contributors is the mechanism by which integration becomes tractable; MIREOT (Courtot et al. 2011) operationalizes the minimum metadata for importing external terms into a local ontology; Ontology Design Patterns (Gangemi 2005; Gangemi & Presutti 2009) capture reusable modelling fragments derived from recurring conceptualization problems; DOLCE (Borgo et al. 2022) and BFO (Otte, Beverley & Ruttenberg 2022) provide upper-level distinctions (continuant vs. occurrent, dependent vs. independent) whose alignment dramatically lowers integration cost. Local synonyms minted in ignorance of these references create silent disagreement at every downstream interface — exactly the integration tax reference ontologies exist to remove.

**Incorrect: local synonym invented without checking reusable reference vocabularies**

```ts
export const CellPart = {
  iri: "https://acme.example/ontology#CellPart",
  definition: "Something inside a biological cell."
};
```

**Correct: Gene Ontology term referenced via MIREOT-style import, with explicit local alias preserved for tooling**

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

Reference: [https://www.nature.com/articles/nbt1346](https://www.nature.com/articles/nbt1346), [https://www.nature.com/articles/ng0500_25](https://www.nature.com/articles/ng0500_25), [https://journals.sagepub.com/doi/10.3233/AO-2011-0087](https://journals.sagepub.com/doi/10.3233/AO-2011-0087), [https://www.researchgate.net/publication/221466152_Ontology_Design_Patterns_for_Semantic_Web_Content](https://www.researchgate.net/publication/221466152_Ontology_Design_Patterns_for_Semantic_Web_Content), [https://www.researchgate.net/publication/227215903_Ontology_Design_Patterns](https://www.researchgate.net/publication/227215903_Ontology_Design_Patterns), [https://journals.sagepub.com/doi/10.3233/AO-210259](https://journals.sagepub.com/doi/10.3233/AO-210259), [https://journals.sagepub.com/doi/10.3233/AO-220262](https://journals.sagepub.com/doi/10.3233/AO-220262)

### 2.3 Use the Weakest Formalism That Satisfies the Required Inference

**Impact: HIGH**

Pick expressivity from the required reasoning workload, not from a default assumption that "ontology" means OWL DL. The OWL 2 Profiles specification (Motik et al. 2012) deliberately splits EL, QL, and RL with distinct PTIME and AC0 complexity guarantees for classification, conjunctive-query answering, and rule-based materialization respectively; McGuinness & van Harmelen (2004) and Horrocks, Patel-Schneider & van Harmelen (2003) trace the SHIQ → OWL design lineage exposing the expressivity-vs-reasoning trade; Xiao et al.'s OBDA survey (IJCAI 2018) and Calvanese et al.'s DL-LiteA work show that query-rewriting tractability is the deployment-critical property for ontology-based data access; SHACL and ShEx (Labra Gayo et al. 2024) cover closed-world constraint validation, a fundamentally different problem from open-world entailment. Mixing concerns — encoding business validation as OWL axioms, or expressing what should be an axiom as imperative TypeScript — produces an ontology that is simultaneously too weak for the inference required and too strong for tractable reasoning.

**Incorrect: business logic, constraints, and inference ad-hoc in code — no formal semantics, no validation gate, no reasoner check**

```ts
function isBillableCustomer(x: any): boolean {
  return x.kind === "person" && x.status !== "deleted" && !!x.paymentMethod;
}
```

**Correct: explicit OWL 2 profile chosen for the required inference, closed-world validation delegated to SHACL, code role bounded**

```ts
export const ontologyProfile = {
  vocabulary: "OWL2-EL",
  reasonerChecks: ["subclassConsistency", "propertyDomainRange"],
  closedWorldValidation: "SHACL",
  codePolicy: "Application code may consume inferred classes but must not redefine them."
} as const;
```

Reference: [https://www.researchgate.net/publication/200034408_OWL_Web_Ontology_Language---Overview](https://www.researchgate.net/publication/200034408_OWL_Web_Ontology_Language---Overview), [https://www.w3.org/TR/owl2-profiles/](https://www.w3.org/TR/owl2-profiles/), [https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3199003](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3199003), [https://research.manchester.ac.uk/en/publications/reducing-owl-entailment-to-description-logic-satisfiability](https://research.manchester.ac.uk/en/publications/reducing-owl-entailment-to-description-logic-satisfiability), [https://www.ijcai.org/proceedings/2018/777](https://www.ijcai.org/proceedings/2018/777), [https://www.diag.uniroma1.it/rosati/publications/CDLLPRR08.htm](https://www.diag.uniroma1.it/rosati/publications/CDLLPRR08.htm), [https://link.springer.com/book/10.1007/978-3-031-79478-0](https://link.springer.com/book/10.1007/978-3-031-79478-0)

---

## 3. Validation — Release-Gate Checks

**Impact: CRITICAL**

A shared ontology is executable semantic infrastructure. Releases that ship without reasoner consistency checks, competency-question entailment, SHACL/ShEx data-shape validation, and empirically-grounded pitfall scans deliver distributed defects directly into downstream consumers — annotations, queries, generated code, and integration mappings inherit every undetected error.

### 3.1 Validate Ontologies With Tests, Reasoners, Shapes, and Pitfall Scanners

**Impact: CRITICAL**

Every ontology release should pass structural, logical, competency-question, and data-shape validation; otherwise the ontology ships distributed defects directly into downstream consumers. Gómez-Pérez (2004) catalogs the criteria — consistency, completeness, conciseness, expandability, sensitiveness — that ontology evaluation has to discriminate; Brank, Grobelnik & Mladenić (2005) survey the evaluation landscape across gold-standard, application-driven, data-driven, and human-assessment families; OntoClean (Guarino & Welty, CACM 2002) targets taxonomic misuse using rigidity, unity, identity, and dependence meta-properties; OOPS! (Poveda-Villalón, Gómez-Pérez & Suárez-Figueroa 2014) is an empirically-grounded pitfall scanner derived from cataloging errors across hundreds of ontologies; RDFUnit and the broader test-driven linked-data quality work (Kontokostas et al. 2014; Labra Gayo et al. 2024 on RDF validation with SHACL/ShEx) operationalize ontology and data quality as executable test cases. A "ship it" without these checks lets unsatisfiable classes, inconsistent axiom sets, unanswerable CQs, and OOPS-catalogued pitfalls into production.

**Incorrect: ontology package ships without semantic or data-conformance tests — no reasoner, no shapes, no pitfall scan**

```ts
export const release = {
  version: "3.4.0",
  terms: loadTerms(),
  tests: []
};
```

**Correct: release gate enumerates the reasoner, CQ, SHACL, and pitfall-scanner checks that must pass before publish**

```ts
export const ontologyReleaseChecks = [
  "reasoner:consistent-classes",
  "reasoner:no-unsatisfiable-classes",
  "cq:all-competency-questions-answerable",
  "shacl:all-production-sample-data-valid",
  "pitfalls:oops-critical-zero"
] as const;
```

Reference: [https://oa.upm.es/72438/](https://oa.upm.es/72438/), [https://www.researchgate.net/publication/228857266_A_survey_of_ontology_evaluation_techniques](https://www.researchgate.net/publication/228857266_A_survey_of_ontology_evaluation_techniques), [https://www.semanticscholar.org/paper/OOPS%21-%28OntOlogy-Pitfall-Scanner%21%29%3A-An-On-line-Tool-Poveda-Villal%C3%B3n-G%C3%B3mez-P%C3%A9rez/28f692a5b6e61ab48bece1221f4e17e05a9a8139](https://www.semanticscholar.org/paper/OOPS%21-%28OntOlogy-Pitfall-Scanner%21%29%3A-An-On-line-Tool-Poveda-Villal%C3%B3n-G%C3%B3mez-P%C3%A9rez/28f692a5b6e61ab48bece1221f4e17e05a9a8139), [https://cacm.acm.org/research/evaluating-ontological-decisions-with-ontoclean/](https://cacm.acm.org/research/evaluating-ontological-decisions-with-ontoclean/), [https://www.researchgate.net/publication/259828947_Test-driven_Evaluation_of_Linked_Data_Quality](https://www.researchgate.net/publication/259828947_Test-driven_Evaluation_of_Linked_Data_Quality), [https://link.springer.com/book/10.1007/978-3-031-79478-0](https://link.springer.com/book/10.1007/978-3-031-79478-0)

---

## 4. Evolution — Versioning and Mappings

**Impact: CRITICAL**

Ontology changes affect data, APIs, queries, generated code, annotations, reasoning results, and downstream integrations. The two artefacts that keep change tractable are explicit versioning with provenance, deprecation, and migration rules, and first-class cross-ontology mappings that make heterogeneity visible, reviewable, and testable instead of hidden inside service code.

### 4.1 Make Cross-Ontology Mappings First-Class Artifacts

**Impact: HIGH**

Naming a shared ontology does not eliminate semantic heterogeneity — local schemas, bounded contexts, and historical data sources continue to use their own representations, so mappings to the shared vocabulary remain a permanent integration concern. Euzenat & Shvaiko's *Ontology Matching* (2013) and Shvaiko & Euzenat's state-of-the-art survey (2013) frame alignments as the central versioned integration artefact; Rahm & Bernstein (2001) catalog schema-matching approaches whose taxonomy remains canonical for relational and structural matching; COMA++ (Aumueller, Do, Massmann & Rahm 2005) operationalizes composite mapping with confidence scoring and reuse of prior alignments; Wache et al.'s ontology-based integration survey (2001) catalogs single-ontology, multiple-ontology, and hybrid approaches; Xiao et al.'s OBDA survey (IJCAI 2018) and Corcho, Priyatna & Chaves-Fraga (2020) connect mappings to query rewriting against local data sources in production deployments. A hidden mapping embedded inside a service function is unreviewable, unversioned, unauthenticated, and untested — every downstream service that consumes its output silently inherits its errors.

**Incorrect: hidden semantic mapping embedded in service code — no review, no version, no confidence, no test**

```ts
function normalizeOrder(row: any) {
  return {
    customerId: row.client_id ?? row.party_ref ?? row.account_holder
  };
}
```

**Correct: mapping is an explicit, versioned, confidence-annotated, testable artefact with declared source and target**

```ts
export const sourceToOntologyMappings = [
  {
    source: "billing.client_id",
    target: "https://acme.example/ontology/customer#LegalCustomer",
    relation: "identifies",
    confidence: 0.98,
    tests: ["billing-client-id-resolves-to-one-legal-customer"]
  }
] as const;
```

Reference: [https://link.springer.com/book/10.1007/978-3-642-38721-0](https://link.springer.com/book/10.1007/978-3-642-38721-0), [https://www.researchgate.net/publication/260324688_Ontology_Matching_State_of_the_Art_and_Future_Challenges](https://www.researchgate.net/publication/260324688_Ontology_Matching_State_of_the_Art_and_Future_Challenges), [https://vldb.org/vldb_journal/index.php/component/article_manager/article/839](https://vldb.org/vldb_journal/index.php/component/article_manager/article/839), [https://www.researchgate.net/publication/221212846_Schema_and_ontology_matching_with_COMA](https://www.researchgate.net/publication/221212846_Schema_and_ontology_matching_with_COMA), [https://www.researchgate.net/publication/200122923_Ontology-based_integration_of_information_---_a_survey_of_existing_approaches](https://www.researchgate.net/publication/200122923_Ontology-based_integration_of_information_---_a_survey_of_existing_approaches), [https://www.ijcai.org/proceedings/2018/777](https://www.ijcai.org/proceedings/2018/777), [https://journals.sagepub.com/doi/10.3233/SW-190384](https://journals.sagepub.com/doi/10.3233/SW-190384)

### 4.2 Version Ontology Changes as Contract Migrations

**Impact: CRITICAL**

Ontology changes affect data, APIs, queries, generated code, annotations, reasoning results, and downstream integrations — every artefact that committed to the prior conceptualization. Klein & Fensel (2001) frame versioning on the Semantic Web as the explicit management of relations between revisions; Noy & Musen (2004) define change-detection and merging operations within an ontology-management framework; Stojanovic, Stojanovic & Handschuh (2002) treat ontology evolution as a six-phase process from change capture through verification; Flouris et al.'s "Ontology Change: Classification and Survey" (2008) and Zablith et al.'s process-centric survey (2015) classify change kinds and trace the evolution lifecycle; PAV (Ciccarese et al. 2013) standardizes provenance, authoring, and versioning metadata reused across biomedical ontologies; Maedche, Motik & Stojanovic (2003) address distributed ontology management across multiple linked versions. Silently mutating a published term — same IRI, redefined meaning — is a breaking change to every consumer whose data, code, or query committed to its prior interpretation.

**Incorrect: silent semantic mutation — same IRI, redefined meaning, no migration, no deprecation, no provenance**

```ts
export const Customer = {
  iri: "https://acme.example/ontology#Customer",
  definition: "A person who logs into the application."
};
```

**Correct: new version IRI, prior version explicitly deprecated, migration rule documented, provenance preserved**

```ts
export const Customer_v2 = {
  iri: "https://acme.example/ontology/v2#Customer",
  definition: "A legal party with an accountable commercial relationship.",
  replaces: "https://acme.example/ontology/v1#Customer",
  migration: "map v1 Customer where kind=person to v2 NaturalPersonCustomer",
  deprecatedTerms: ["https://acme.example/ontology/v1#Customer"]
};
```

Reference: [https://www.researchgate.net/publication/2377424_Ontology_versioning_on_the_Semantic_Web](https://www.researchgate.net/publication/2377424_Ontology_versioning_on_the_Semantic_Web), [https://www.researchgate.net/publication/3454215_Ontology_versioning_in_an_ontology_management_framework](https://www.researchgate.net/publication/3454215_Ontology_versioning_in_an_ontology_management_framework), [https://aisel.aisnet.org/ecis2002/123/](https://aisel.aisnet.org/ecis2002/123/), [https://www.cambridge.org/core/services/aop-cambridge-core/content/view/EEF2FB377B9125CBB784E6F1B6853404/S0269888908001367a.pdf/ontology-change-classification-and-survey.pdf](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/EEF2FB377B9125CBB784E6F1B6853404/S0269888908001367a.pdf/ontology-change-classification-and-survey.pdf), [https://www.cambridge.org/core/services/aop-cambridge-core/content/view/CE4387A954917B7CA3282CE25FAC09FA/S0269888913000349a.pdf/ontology-evolution-a-process-centric-survey.pdf](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/CE4387A954917B7CA3282CE25FAC09FA/S0269888913000349a.pdf/ontology-evolution-a-process-centric-survey.pdf), [https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-4-37](https://jbiomedsem.biomedcentral.com/articles/10.1186/2041-1480-4-37), [https://research.manchester.ac.uk/en/publications/managing-multiple-and-distributed-ontologies-on-the-semantic-web](https://research.manchester.ac.uk/en/publications/managing-multiple-and-distributed-ontologies-on-the-semantic-web)

---

## 5. Governance — Editorial Workflow and Measurement

**Impact: HIGH**

A shared ontology encodes social agreement among stakeholders, so the editorial workflow and the value-measurement story are part of the engineering surface. Without explicit roles, proposal flow, domain-expert review, and operational measures of use (CQ pass rate, mapping reuse, adapter logic removed), the ontology drifts toward whichever local interpretation wins the last merge.

### 5.1 Govern Shared Ontologies With Collaborative Editorial Workflow

**Impact: HIGH**

A shared ontology encodes social agreement among stakeholders; solo edits create local truth masquerading as enterprise truth. Simperl & Luczak-Rösch's collaborative-ontology-engineering survey (KER 2014) shows empirically that community-driven, workflow-managed change is the sustainable maintenance model; WebProtégé (Tudorache, Nyulas, Noy & Musen 2013; Horridge et al. 2019) demonstrates production deployment of role-based collaborative editing with discussion threads, change proposals, and review; Holsapple & Joshi (CACM 2002) frame ontology design as a collaborative process gated by structured domain-expert input; Palma et al. (2011) treat change management as the integrating mechanism for distributed ontology development; the NeOn methodology (Suárez-Figueroa et al. 2015) and the OBO Foundry's editorial process (Smith et al. 2007) operationalize roles, proposals, and decision records as the apparatus that converts disagreement into versioned change. Without a workflow, the ontology becomes whatever the last engineer to push believed it should be — at which point it stops being a shared contract.

**Incorrect: developer-local semantic authority — no domain expert, no review, no decision record**

```ts
await ontologyRepo.merge({
  author: "backend-dev",
  change: "rename Party to Customer because it sounds clearer",
  reviewers: []
});
```

**Correct: proposal references the affected terms and CQs, names the required reviewers, and produces a decision record**

```ts
await ontologyRepo.proposeChange({
  changeId: "ONT-742",
  affectedTerms: ["Party", "Customer"],
  competencyQuestions: ["CQ-001", "CQ-017"],
  reviewers: ["domain-owner", "data-architect", "service-owner"],
  decisionRecord: "ADR-ontology-742-party-customer-boundary"
});
```

Reference: [https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0269888913000192](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0269888913000192), [https://journals.sagepub.com/doi/10.3233/SW-2012-0057](https://journals.sagepub.com/doi/10.3233/SW-2012-0057), [https://www.researchgate.net/publication/333075611_WebProtege_A_Cloud-Based_Ontology_Editor](https://www.researchgate.net/publication/333075611_WebProtege_A_Cloud-Based_Ontology_Editor), [https://cacm.acm.org/research/a-collaborative-approach-to-ontology-design/](https://cacm.acm.org/research/a-collaborative-approach-to-ontology-design/), [https://www.sciencedirect.com/science/article/abs/pii/S1570826811000503](https://www.sciencedirect.com/science/article/abs/pii/S1570826811000503), [https://journals.sagepub.com/doi/abs/10.3233/AO-150145](https://journals.sagepub.com/doi/abs/10.3233/AO-150145), [https://www.nature.com/articles/nbt1346](https://www.nature.com/articles/nbt1346)

### 5.2 Measure Ontology Value by Operational Use, Not Aesthetic Completeness

**Impact: MEDIUM**

Judge a shared ontology by observable software and data outcomes — annotation coverage, CQ pass rate, queryable integrations, mapping reuse, data-validation pass rate, removed adapter logic, and downstream adoption — not by term count or taxonomic elegance. The Gene Ontology (Ashburner et al. 2000) and the OBO Foundry (Smith et al. 2007) are measured in practice by annotated entity coverage and cross-resource interoperability in production biology; Wache et al. (2001) evaluate ontology-based integration by what it actually queries; the Statoil OBDA deployment (Kharlamov et al. 2017) reports operational metrics — query latency, business-user query authorship rate — as the measure of fit; Corcho, Priyatna & Chaves-Fraga (2020) survey OBDA in production with the same operational orientation; software-engineering ontology literature (Calero, Ruiz & Piattini 2006; Happel & Seedorf 2006) and linked-data quality testing (Kontokostas et al. 2014) evaluate ontologies by the outcomes they enable rather than by curated term counts. Vanity metrics reward growth that nobody consumes.

**Incorrect: vanity metric — counts terms, not whether anyone can use them**

```ts
const ontologyScore = ontology.terms.length;
```

**Correct: portfolio of operational outcomes the ontology is supposed to enable, each tied to a downstream consumer**

```ts
const ontologyScore = {
  competencyQuestionsPassing: 42 / 44,
  productionEventsAnnotated: 0.91,
  mappingsReusedAcrossServices: 18,
  shaclValidationPassRate: 0.987,
  adapterBranchesRemoved: 37
};
```

Reference: [https://www.nature.com/articles/ng0500_25](https://www.nature.com/articles/ng0500_25), [https://www.nature.com/articles/nbt1346](https://www.nature.com/articles/nbt1346), [https://www.researchgate.net/publication/200122923_Ontology-based_integration_of_information_---_a_survey_of_existing_approaches](https://www.researchgate.net/publication/200122923_Ontology-based_integration_of_information_---_a_survey_of_existing_approaches), [https://www.sciencedirect.com/science/article/pii/S1570826817300276](https://www.sciencedirect.com/science/article/pii/S1570826817300276), [https://journals.sagepub.com/doi/10.3233/SW-190384](https://journals.sagepub.com/doi/10.3233/SW-190384), [https://link.springer.com/book/10.1007/3-540-34518-3](https://link.springer.com/book/10.1007/3-540-34518-3), [https://www.researchgate.net/publication/228386661_Applications_of_ontologies_in_software_engineering](https://www.researchgate.net/publication/228386661_Applications_of_ontologies_in_software_engineering), [https://www.researchgate.net/publication/259828947_Test-driven_Evaluation_of_Linked_Data_Quality](https://www.researchgate.net/publication/259828947_Test-driven_Evaluation_of_Linked_Data_Quality)

---

## References

1. [https://tomgruber.org/writing/ontolingua-kaj-1993/](https://tomgruber.org/writing/ontolingua-kaj-1993/)
2. [https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html](https://protege.stanford.edu/publications/ontology_development/ontology101-noy-mcguinness.html)
3. [https://www.w3.org/TR/owl2-profiles/](https://www.w3.org/TR/owl2-profiles/)
4. [https://www.w3.org/TR/shacl/](https://www.w3.org/TR/shacl/)
5. [https://www.nature.com/articles/nbt1346](https://www.nature.com/articles/nbt1346)
6. [https://www.nature.com/articles/ng0500_25](https://www.nature.com/articles/ng0500_25)
7. [https://link.springer.com/book/10.1007/978-3-642-38721-0](https://link.springer.com/book/10.1007/978-3-642-38721-0)
8. [https://www.ijcai.org/proceedings/2018/777](https://www.ijcai.org/proceedings/2018/777)
9. [https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0269888913000192](https://www.cambridge.org/core/services/aop-cambridge-core/content/view/S0269888913000192)
10. [https://link.springer.com/book/10.1007/978-3-031-79478-0](https://link.springer.com/book/10.1007/978-3-031-79478-0)

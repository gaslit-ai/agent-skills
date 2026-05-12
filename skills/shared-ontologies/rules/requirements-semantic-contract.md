---
title: Treat the Shared Ontology as a Semantic Contract, Not a Naming Convention
impact: CRITICAL
tags: requirements, semantic-contract, definitions, shared-vocabulary, interoperability
---

## Treat the Shared Ontology as a Semantic Contract, Not a Naming Convention

Gruber's "A Translation Approach to Portable Ontology Specifications" (1993) defines an ontology as an explicit specification of a conceptualization — vocabulary, definitions, relations, axioms — that an agent commits to when sharing knowledge; Uschold & Grüninger (1996) generalize this to inter-agent agreement on representational vocabulary, not on choice of label. The software-engineering ontology literature (Calero, Ruiz & Piattini 2006; Ruiz & Hilera 2006; Happel & Seedorf 2006; Akerman & Tyree 2006) treats common terminology with explicit definitions, relations, and constraints as the prerequisite for reuse across stakeholders, models, and tools. A shared label without a definition, a broader/narrower relation, or a constraint is not a contract — it is a naming collision waiting to surface the first time two services with identical labels turn out to disagree on extension.

**Incorrect (same label, different semantics across services — no commitment, no contract):**

```ts
type BillingCustomer = { id: string; customerType: "customer" };
type SupportCustomer = { id: string; customerType: "customer" };
// no shared definition: payer? user? legal party? contact?
```

**Correct (each term carries IRI, label, definition, and a broader-than relation — a commitment downstream consumers can reason about):**

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

References:
- [Gruber (1993) — A Translation Approach to Portable Ontology Specifications](https://tomgruber.org/writing/ontolingua-kaj-1993/)
- [Uschold & Grüninger (1996) — Ontologies: Principles, Methods and Applications](https://www.researchgate.net/publication/302937543_Ontologies_Principles_methods_and_applications)
- [Calero, Ruiz & Piattini (2006) — Ontologies for Software Engineering and Software Technology](https://link.springer.com/book/10.1007/3-540-34518-3)
- [Ruiz & Hilera (2006) — Using Ontologies in Software Engineering and Technology](https://link.springer.com/chapter/10.1007/3-540-34518-3_2)
- [Happel & Seedorf (2006) — Applications of Ontologies in Software Engineering](https://www.researchgate.net/publication/228386661_Applications_of_ontologies_in_software_engineering)
- [Akerman & Tyree (2006) — Using Ontology to Support Development of Software Architectures](https://www.researchgate.net/publication/224101625_Using_ontology_to_support_development_of_software_architectures)

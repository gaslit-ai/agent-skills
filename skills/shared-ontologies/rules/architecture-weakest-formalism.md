---
title: Use the Weakest Formalism That Satisfies the Required Inference
impact: HIGH
tags: architecture, expressivity, reasoning, owl-profiles, shacl, tractability
---

## Use the Weakest Formalism That Satisfies the Required Inference

Pick expressivity from the required reasoning workload, not from a default assumption that "ontology" means OWL DL. The OWL 2 Profiles specification (Motik et al. 2012) deliberately splits EL, QL, and RL with distinct PTIME and AC0 complexity guarantees for classification, conjunctive-query answering, and rule-based materialization respectively; McGuinness & van Harmelen (2004) and Horrocks, Patel-Schneider & van Harmelen (2003) trace the SHIQ → OWL design lineage exposing the expressivity-vs-reasoning trade; Xiao et al.'s OBDA survey (IJCAI 2018) and Calvanese et al.'s DL-LiteA work show that query-rewriting tractability is the deployment-critical property for ontology-based data access; SHACL and ShEx (Labra Gayo et al. 2024) cover closed-world constraint validation, a fundamentally different problem from open-world entailment. Mixing concerns — encoding business validation as OWL axioms, or expressing what should be an axiom as imperative TypeScript — produces an ontology that is simultaneously too weak for the inference required and too strong for tractable reasoning.

**Incorrect (business logic, constraints, and inference ad-hoc in code — no formal semantics, no validation gate, no reasoner check):**

```ts
function isBillableCustomer(x: any): boolean {
  return x.kind === "person" && x.status !== "deleted" && !!x.paymentMethod;
}
```

**Correct (explicit OWL 2 profile chosen for the required inference, closed-world validation delegated to SHACL, code role bounded):**

```ts
export const ontologyProfile = {
  vocabulary: "OWL2-EL",
  reasonerChecks: ["subclassConsistency", "propertyDomainRange"],
  closedWorldValidation: "SHACL",
  codePolicy: "Application code may consume inferred classes but must not redefine them."
} as const;
```

References:
- [McGuinness & van Harmelen (2004) — OWL Web Ontology Language Overview](https://www.researchgate.net/publication/200034408_OWL_Web_Ontology_Language---Overview)
- [Motik et al. (2012) — OWL 2 Web Ontology Language Profiles](https://www.w3.org/TR/owl2-profiles/)
- [Horrocks, Patel-Schneider & van Harmelen (2003) — From SHIQ and RDF to OWL](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3199003)
- [Horrocks & Patel-Schneider — Reducing OWL Entailment to Description Logic Satisfiability](https://research.manchester.ac.uk/en/publications/reducing-owl-entailment-to-description-logic-satisfiability)
- [Xiao et al. (2018) — Ontology-Based Data Access: A Survey](https://www.ijcai.org/proceedings/2018/777)
- [Calvanese et al. (2008) — Data Integration through DL-LiteA Ontologies](https://www.diag.uniroma1.it/rosati/publications/CDLLPRR08.htm)
- [Labra Gayo et al. (2024) — Validating RDF Data](https://link.springer.com/book/10.1007/978-3-031-79478-0)

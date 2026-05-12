---
title: Make Cross-Ontology Mappings First-Class Artifacts
impact: HIGH
tags: evolution, mappings, alignment, schema-matching, obda, integration
---

## Make Cross-Ontology Mappings First-Class Artifacts

Naming a shared ontology does not eliminate semantic heterogeneity — local schemas, bounded contexts, and historical data sources continue to use their own representations, so mappings to the shared vocabulary remain a permanent integration concern. Euzenat & Shvaiko's *Ontology Matching* (2013) and Shvaiko & Euzenat's state-of-the-art survey (2013) frame alignments as the central versioned integration artefact; Rahm & Bernstein (2001) catalog schema-matching approaches whose taxonomy remains canonical for relational and structural matching; COMA++ (Aumueller, Do, Massmann & Rahm 2005) operationalizes composite mapping with confidence scoring and reuse of prior alignments; Wache et al.'s ontology-based integration survey (2001) catalogs single-ontology, multiple-ontology, and hybrid approaches; Xiao et al.'s OBDA survey (IJCAI 2018) and Corcho, Priyatna & Chaves-Fraga (2020) connect mappings to query rewriting against local data sources in production deployments. A hidden mapping embedded inside a service function is unreviewable, unversioned, unauthenticated, and untested — every downstream service that consumes its output silently inherits its errors.

**Incorrect (hidden semantic mapping embedded in service code — no review, no version, no confidence, no test):**

```ts
function normalizeOrder(row: any) {
  return {
    customerId: row.client_id ?? row.party_ref ?? row.account_holder
  };
}
```

**Correct (mapping is an explicit, versioned, confidence-annotated, testable artefact with declared source and target):**

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

References:
- [Euzenat & Shvaiko (2013) — Ontology Matching](https://link.springer.com/book/10.1007/978-3-642-38721-0)
- [Shvaiko & Euzenat (2013) — Ontology Matching: State of the Art and Future Challenges](https://www.researchgate.net/publication/260324688_Ontology_Matching_State_of_the_Art_and_Future_Challenges)
- [Rahm & Bernstein (2001) — A Survey of Approaches to Automatic Schema Matching](https://vldb.org/vldb_journal/index.php/component/article_manager/article/839)
- [Aumueller, Do, Massmann & Rahm (2005) — Schema and Ontology Matching with COMA++](https://www.researchgate.net/publication/221212846_Schema_and_ontology_matching_with_COMA)
- [Wache et al. (2001) — Ontology-Based Integration of Information](https://www.researchgate.net/publication/200122923_Ontology-based_integration_of_information_---_a_survey_of_existing_approaches)
- [Xiao et al. (2018) — Ontology-Based Data Access: A Survey](https://www.ijcai.org/proceedings/2018/777)
- [Corcho, Priyatna & Chaves-Fraga (2020) — Towards a New Generation of Ontology-Based Data Access](https://journals.sagepub.com/doi/10.3233/SW-190384)

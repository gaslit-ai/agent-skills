---
name: shared-ontologies
description: Evidence-based playbook for designing, evolving, and governing shared ontologies across systems and teams. Use when introducing a shared vocabulary, integrating data across services, picking ontology expressivity, validating ontology releases, versioning semantic changes, or aligning a new schema with an existing reference ontology. Triggers on tasks framed as "shared ontology", "domain model", "controlled vocabulary", "semantic schema", "data integration", "ontology mapping", or "ontology alignment".
license: MIT
metadata:
  author: duke
  version: "0.1.0"
---

# Shared Ontologies

Evidence-based guidance for shared ontologies in software systems. Grounded in 50+ peer-reviewed or canonical sources from ontology engineering, semantic web, software-engineering ontology, biomedical ontology, data integration, schema matching, and ontology evolution.

## Scope and Factuality Framing

**Scope.** "Shared ontologies" in this skill means shared semantic artifacts used across services, schemas, APIs, knowledge graphs, validation layers, annotations, data-access mappings, or architecture artifacts — not single-service data models.

**Factuality controls.** Each rule separates *source-backed evidence* synthesized from the cited literature from *derived engineering guidance* (the actionable rule). Per-rule frontmatter records `evidenceStrength` and `corroborationCount` (number of independent source families repeating the claim) in place of subjective confidence levels. Code examples are synthetic implementation sketches that illustrate the rule; they are not examples observed in, or claimed by, the cited papers.

## When to Apply

- Introducing a shared vocabulary across services, teams, or organizations
- Integrating data across systems that historically used distinct local schemas
- Choosing ontology expressivity (RDF/SKOS vs. OWL profile vs. OWL DL vs. rules vs. SHACL)
- Validating an ontology release before downstream consumers depend on it
- Versioning a semantic change that affects published data, queries, or generated code
- Aligning a new local schema with an existing reference or upper ontology
- Reviewing a proposal that adds, renames, deprecates, or splits ontology terms

## When Not to Apply

- Designing the internal data model of a single bounded context with no cross-system consumers
- Producing a one-off ETL mapping between two specific tables (no shared vocabulary asserted)
- Greenfield UI labelling and copy work
- Database schema migrations where no formal conceptualization is being committed to

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Requirements — purpose, scope, contract | CRITICAL | `requirements-` |
| 2 | Architecture — reuse, modularity, expressivity | HIGH | `architecture-` |
| 3 | Validation — release-gate checks | CRITICAL | `validation-` |
| 4 | Evolution — versioning and mappings | CRITICAL | `evolution-` |
| 5 | Governance — editorial workflow and measurement | HIGH | `governance-` |

## Quick Reference

- `requirements-competency-questions` — Define ontology scope with competency questions before adding shared terms
- `requirements-semantic-contract` — Treat shared ontology terms as semantic contracts, not naming conventions
- `architecture-reuse-reference` — Reuse reference ontologies when they match the competency questions
- `architecture-modular-boundaries` — Modularize shared ontologies around stable software and data boundaries
- `architecture-weakest-formalism` — Choose ontology expressivity from the required inference and validation workload
- `validation-tests-reasoners-shapes` — Validate ontology releases with competency tests, reasoners, shapes, and pitfall checks
- `evolution-versioned-migrations` — Version ontology changes as semantic migrations
- `evolution-mappings-first-class` — Make schema-to-ontology and ontology-to-ontology mappings first-class artifacts
- `governance-editorial-workflow` — Govern shared ontologies with collaborative editorial workflow
- `governance-operational-measurement` — Measure ontology value by operational interoperability, not term count

## How to Use

1. Pin **requirements** first — competency questions and scope are the evaluation oracle for every subsequent decision.
2. Make **architecture** choices second — reuse what exists, modularize what you must mint, pick the weakest formalism that supports the required inference and validation workload.
3. Define **validation** gates before consumers depend on the ontology — reasoner, CQ, SHACL, and pitfall scans.
4. Plan **evolution** at the same time — every published term has a versioning, deprecation, and mapping policy from day one.
5. Set **governance** explicitly — roles, proposal workflow, review, decision records, and operational measures that confirm the ontology is being used.

Read individual rule files in `rules/` for examples. The compiled long-form guide is `AGENTS.md`.

## Full Compiled Document

For expanded guidance with grouped sections, see `AGENTS.md`.

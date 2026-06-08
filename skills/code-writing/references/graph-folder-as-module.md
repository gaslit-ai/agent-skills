---
title: Make Folder Structure Mirror the Module Dependency Graph
impact: CRITICAL
tags: graph, folders, modules, hierarchical-localization, cross-file
---

## Make Folder Structure Mirror the Module Dependency Graph

**Impact: CRITICAL**

The dominant gains in repository-level coding agents from 2023 onward come from exposing code as a graph the agent can traverse rather than a bag of files. RepoGraph (ICLR 2025) yields a 32.8% relative improvement on SWE-bench by constructing an explicit repo-level graph; Code Graph Model (NeurIPS 2025) bakes graph structure into LLM attention and reaches 43% on SWE-bench Lite with open Qwen weights; CodexGraph (NAACL 2025) exposes the repo as a queryable Neo4j-style database so the agent issues Cypher queries to locate symbols. Agentless (Xia et al. PACMSE 2025) beat full agent scaffolds on SWE-bench Lite using a three-stage hierarchical localizer (file → class/function → edit location) — concrete evidence that codebases admitting such hierarchical narrowing are agent-tractable. The corollary: folder hierarchy that does not match module boundaries forces the agent to reconstruct the graph from text, and it loses cross-file edges in the process.

**Incorrect (flat or implementation-detail layout — module graph not legible from folder structure):**

```
src/
  utils.ts
  helpers.ts
  customer.ts
  customerHelpers.ts
  customerUtils.ts
  billing.ts
  billingHelpers.ts
  index.ts
```

**Correct (folder structure encodes the module graph; each folder is one cohesive concept):**

```
src/
  domain/
    legal-party/
      legal-party.types.ts
      legal-party.ts
      index.ts        // public surface only
    billing-event/
      billing-event.types.ts
      billing-event.ts
      index.ts
  services/
    billing/
      billing.service.ts
      billing.repository.ts
      index.ts
    identity/
      identity.service.ts
      index.ts
  app/
    routes.ts
    server.ts
```

References:
- [Ouyang et al. — RepoGraph: Enhancing AI Software Engineering with Repository-level Code Graph (ICLR 2025)](https://arxiv.org/abs/2410.14684)
- [Tao et al. — Code Graph Model: A Graph-Integrated LLM for Repository-Level SE Tasks (NeurIPS 2025)](https://arxiv.org/abs/2505.16901)
- [Liu et al. — CodexGraph: Bridging LLMs and Code Repositories via Code Graph Databases (NAACL 2025)](https://aclanthology.org/2025.naacl-long.7/)
- [Xia et al. — Agentless: Demystifying LLM-based Software Engineering Agents](https://arxiv.org/abs/2407.01489)
- [Bairi et al. — CodePlan: Repository-level Coding using LLMs and Planning (FSE 2024)](https://arxiv.org/abs/2309.12499)
- [Yamaguchi et al. — Modeling and Discovering Vulnerabilities with Code Property Graphs (IEEE S&P Test-of-Time 2024)](https://joern.io/impact/)

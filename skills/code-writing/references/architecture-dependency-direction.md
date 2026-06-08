---
title: Make Dependency Direction Explicit; Domain Points Inward, Adapters Point Out
impact: CRITICAL
tags: architecture, hexagonal, ports-adapters, clean-architecture, dependency-inversion
---

## Make Dependency Direction Explicit; Domain Points Inward, Adapters Point Out

**Impact: CRITICAL**

The two empirical results that justify dependency-direction discipline as a CRITICAL rule are: (a) the 0%-vs-80% hexagonal-violation gap between SOTA and open-weight models under enforcement, from the "Quantitative Pattern Conformance" study (arXiv 2512.04273), and (b) LocAgent (ACL 2025) achieving 92.7% file-level localization and +12% Pass@10 on issue resolution specifically through multi-hop reasoning over directed code graphs. Direction is the property that makes a code graph *useful for navigation* rather than just present. Cockburn's 2024 "Hexagonal Architecture Explained" is the definitive modern restatement: domain inside, ports as narrow contracts, adapters absorbing transport/persistence complexity. Mark Seemann's 2025 "Ports and Fat Adapters" essay is the necessary counterweight — naive "port every IO" rules produce shallow modules; ports should stay narrow while adapters carry weight. Vertical Slice Architecture (Jimmy Bogard) is often a better fit than horizontal layered Clean Architecture for agent navigation because it co-locates everything a feature needs in one path — but the dependency-direction rule (feature → shared infrastructure, never the reverse) still holds.

**Incorrect (domain reaches into HTTP and DB layers; dependency direction inverted):**

```ts
// src/domain/legal-party.ts — domain depends on transport and infra
import express from 'express';                            // wrong direction
import { dbPool } from '../infra/postgres-pool';           // wrong direction

export class LegalParty {
  static async find(req: express.Request): Promise<LegalParty> {
    const row = await dbPool.query('SELECT ...');          // domain owns SQL
    return new LegalParty(row);
  }
}
```

**Correct (domain knows only its own types; adapters depend on domain ports, never reverse):**

```ts
// src/domain/legal-party/legal-party.ts — no transport or infra imports
import type { LegalPartyId } from './legal-party.types';

export interface LegalParty {
  readonly legalPartyId: LegalPartyId;
  readonly displayName: string;
}

// Port: declared by domain; signature is the contract.
export interface LegalPartyRepository {
  findById(id: LegalPartyId): Promise<LegalParty | null>;
}

// src/adapters/postgres/postgres-legal-party-repository.ts
// Adapter depends on domain (correct direction); domain knows nothing about it.
import type { LegalParty, LegalPartyId, LegalPartyRepository }
  from '@/domain/legal-party';
import type { Pool } from 'pg';

export class PostgresLegalPartyRepository implements LegalPartyRepository {
  constructor(private readonly pool: Pool) {}
  async findById(id: LegalPartyId): Promise<LegalParty | null> {
    const result = await this.pool.query(
      'SELECT legal_party_id, display_name FROM legal_parties WHERE legal_party_id = $1',
      [id],
    );
    return result.rows[0] ? toLegalParty(result.rows[0]) : null;
  }
}
```

References:
- [Cockburn & Garrido de Paz — Hexagonal Architecture Explained (2024/2025)](https://www.amazon.com/Hexagonal-Architecture-Explained-architecture-simplifies/dp/B0F5QSH28F)
- [Seemann — Ports and Fat Adapters (ploeh blog, April 2025)](https://blog.ploeh.dk/2025/04/01/ports-and-fat-adapters/)
- [Quantitative Pattern Conformance in AI-Synthesized Microservices (arXiv 2512.04273)](https://arxiv.org/pdf/2512.04273)
- [Chen et al. — LocAgent: Graph-Guided LLM Agents for Code Localization (ACL 2025)](https://arxiv.org/abs/2503.09089)
- [Ouyang et al. — RepoGraph (ICLR 2025)](https://arxiv.org/abs/2410.14684)
- [Vernon & Jaskuła — Strategic Monoliths and Microservices (Addison-Wesley 2022)](https://www.oreilly.com/library/view/strategic-monoliths-and/9780137355600/)
- [Comparative Review of Clean Architecture and Vertical Slice Architecture (AIM 2025)](https://aimjournals.com/index.php/ijaair/article/download/413/363/874)

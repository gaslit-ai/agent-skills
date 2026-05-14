import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { SkillConfig } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SKILLS_DIR = join(__dirname, '../../..', 'skills')
const BUILD_DIR = join(__dirname, '..')

export const SKILLS: Record<string, SkillConfig> = {
  'duke-dependency-generator': {
    name: 'duke-dependency-generator',
    title: 'Duke Dependency Generator',
    description: 'TypeScript architecture graph generation workflows',
    skillDir: join(SKILLS_DIR, 'duke-dependency-generator'),
    referencesDir: join(SKILLS_DIR, 'duke-dependency-generator/references'),
    referencesFolder: 'references',
    metadataFile: join(SKILLS_DIR, 'duke-dependency-generator/metadata.json'),
    outputFile: join(SKILLS_DIR, 'duke-dependency-generator/AGENTS.md'),
    sectionMap: {
      bootstrap: 1,
      scope: 2,
      deps: 3,
      types: 4,
      callgraph: 5,
      cli: 6,
      verify: 7,
      ops: 8
    }
  },
  'refactoring-playbook': {
    name: 'refactoring-playbook',
    title: 'Refactoring Playbook',
    description: 'Evidence-based refactoring guidance for code bases',
    skillDir: join(SKILLS_DIR, 'refactoring-playbook'),
    referencesDir: join(SKILLS_DIR, 'refactoring-playbook/references'),
    referencesFolder: 'references',
    metadataFile: join(SKILLS_DIR, 'refactoring-playbook/metadata.json'),
    outputFile: join(SKILLS_DIR, 'refactoring-playbook/AGENTS.md'),
    sectionMap: {
      triggers: 1,
      safety: 2,
      review: 3,
      automation: 4,
      measure: 5
    }
  },
  'shared-ontologies': {
    name: 'shared-ontologies',
    title: 'Shared Ontologies',
    description: 'Evidence-based guidance for designing, evolving, and governing shared ontologies',
    skillDir: join(SKILLS_DIR, 'shared-ontologies'),
    referencesDir: join(SKILLS_DIR, 'shared-ontologies/references'),
    referencesFolder: 'references',
    metadataFile: join(SKILLS_DIR, 'shared-ontologies/metadata.json'),
    outputFile: join(SKILLS_DIR, 'shared-ontologies/AGENTS.md'),
    sectionMap: {
      requirements: 1,
      architecture: 2,
      validation: 3,
      evolution: 4,
      governance: 5
    }
  },
  'code-writing': {
    name: 'code-writing',
    title: 'Code Writing',
    description: 'Evidence-based rules for writing code as a knowledge graph that orients agentic AI in vector space',
    skillDir: join(SKILLS_DIR, 'code-writing'),
    referencesDir: join(SKILLS_DIR, 'code-writing/references'),
    referencesFolder: 'references',
    metadataFile: join(SKILLS_DIR, 'code-writing/metadata.json'),
    outputFile: join(SKILLS_DIR, 'code-writing/AGENTS.md'),
    sectionMap: {
      identifiers: 1,
      types: 2,
      graph: 3,
      architecture: 3,
      sizing: 4,
      composition: 5,
      descriptors: 6,
      monorepo: 7,
      gates: 8
    }
  }
}

export const DEFAULT_SKILL = 'duke-dependency-generator'
export const TEST_CASES_FILE = join(BUILD_DIR, 'test-cases.json')

export function resolveTestCasesFile(skillName: string): string {
  if (skillName === DEFAULT_SKILL) {
    return TEST_CASES_FILE
  }
  return join(BUILD_DIR, `test-cases.${skillName}.json`)
}

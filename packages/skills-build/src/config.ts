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
    rulesDir: join(SKILLS_DIR, 'duke-dependency-generator/rules'),
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
    rulesDir: join(SKILLS_DIR, 'refactoring-playbook/rules'),
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
    rulesDir: join(SKILLS_DIR, 'shared-ontologies/rules'),
    metadataFile: join(SKILLS_DIR, 'shared-ontologies/metadata.json'),
    outputFile: join(SKILLS_DIR, 'shared-ontologies/AGENTS.md'),
    sectionMap: {
      requirements: 1,
      architecture: 2,
      validation: 3,
      evolution: 4,
      governance: 5
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

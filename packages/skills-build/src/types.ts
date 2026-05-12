export type ImpactLevel =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM-HIGH'
  | 'MEDIUM'
  | 'LOW-MEDIUM'
  | 'LOW'

export interface CodeExample {
  label: string
  description?: string
  code: string
  language?: string
  additionalText?: string
}

export interface Reference {
  id: string
  title: string
  section: number
  subsection?: number
  impact: ImpactLevel
  impactDescription?: string
  explanation: string
  examples: CodeExample[]
  references?: string[]
  tags?: string[]
}

export interface Section {
  number: number
  title: string
  impact: ImpactLevel
  impactDescription?: string
  introduction?: string
  references: Reference[]
}

export interface TestCase {
  referenceId: string
  referenceTitle: string
  type: 'bad' | 'good'
  code: string
  language: string
  description?: string
}

export interface SkillConfig {
  name: string
  title: string
  description: string
  skillDir: string
  /** Directory containing per-reference source files (spec-canonical name).
   *  Conventionally `references/` under the skill root. */
  referencesDir: string
  metadataFile: string
  /** Path to the compiled long-form AGENTS.md output. */
  outputFile: string
  /** Path to the compiled SKILL.md output. Defaults to `<skillDir>/SKILL.md`. */
  skillMdFile?: string
  /** Folder name (relative to skillDir) that the generated SKILL.md's TOC links
   *  into. Should be the basename of `referencesDir`. */
  referencesFolder: string
  sectionMap: Record<string, number>
}

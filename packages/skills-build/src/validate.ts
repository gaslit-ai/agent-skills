#!/usr/bin/env node

import { readdir } from 'fs/promises'
import { join } from 'path'
import { DEFAULT_SKILL, SKILLS } from './config.js'
import { Reference, SkillConfig } from './types.js'
import { parseReferenceFile } from './parser.js'

interface ValidationError {
  skill: string
  file: string
  message: string
}

function validateReference(reference: Reference, skill: string, file: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!reference.title.trim()) {
    errors.push({ skill, file, message: 'Missing title' })
  }

  if (!reference.explanation.trim()) {
    errors.push({ skill, file, message: 'Missing explanation body' })
  }

  if (!reference.examples || reference.examples.length === 0) {
    errors.push({ skill, file, message: 'Missing examples' })
    return errors
  }

  const codeExamples = reference.examples.filter((example) => example.code.trim().length > 0)
  if (codeExamples.length === 0) {
    errors.push({ skill, file, message: 'No code examples found' })
    return errors
  }

  // Word-boundary guards: `Incorrect` must not classify as `correct`.
  const hasBad = codeExamples.some((example) => /\b(incorrect|wrong|bad)\b/i.test(example.label))
  const hasGood = codeExamples.some((example) => /\b(correct|good|usage|implementation|example)\b/i.test(example.label))

  if (!hasBad || !hasGood) {
    errors.push({ skill, file, message: 'Need both bad and good code examples' })
  }

  const validImpacts = ['CRITICAL', 'HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW-MEDIUM', 'LOW']
  if (!validImpacts.includes(reference.impact)) {
    errors.push({ skill, file, message: `Invalid impact level: ${reference.impact}` })
  }

  return errors
}

async function validateSkill(skill: SkillConfig): Promise<ValidationError[]> {
  const files = await readdir(skill.referencesDir)
  const referenceFiles = files.filter((file) => file.endsWith('.md') && !file.startsWith('_') && file !== 'README.md')

  const errors: ValidationError[] = []

  for (const file of referenceFiles) {
    try {
      const { reference } = await parseReferenceFile(join(skill.referencesDir, file), skill.sectionMap)
      errors.push(...validateReference(reference, skill.name, file))
    } catch (error) {
      errors.push({
        skill: skill.name,
        file,
        message: `Parse failure: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  }

  if (errors.length === 0) {
    console.log(`✓ ${skill.name}: ${referenceFiles.length} reference files valid`)
  }

  return errors
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const buildAll = args.includes('--all')
  const skillArg = args.find((arg) => arg.startsWith('--skill='))
  const skillName = skillArg ? skillArg.split('=')[1] : null

  if (skillName && !SKILLS[skillName]) {
    console.error(`Unknown skill: ${skillName}`)
    process.exit(1)
  }

  const targets: SkillConfig[] = buildAll
    ? Object.values(SKILLS)
    : skillName
      ? [SKILLS[skillName]]
      : [SKILLS[DEFAULT_SKILL]]

  const errors: ValidationError[] = []
  for (const skill of targets) {
    errors.push(...(await validateSkill(skill)))
  }

  if (errors.length > 0) {
    console.error('Validation failed:')
    errors.forEach((error) => console.error(`- [${error.skill}] ${error.file}: ${error.message}`))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

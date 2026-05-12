#!/usr/bin/env node

import { readdir } from 'fs/promises'
import { join } from 'path'
import { DEFAULT_SKILL, SKILLS } from './config.js'
import { Rule, SkillConfig } from './types.js'
import { parseRuleFile } from './parser.js'

interface ValidationError {
  skill: string
  file: string
  message: string
}

function validateRule(rule: Rule, skill: string, file: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!rule.title.trim()) {
    errors.push({ skill, file, message: 'Missing title' })
  }

  if (!rule.explanation.trim()) {
    errors.push({ skill, file, message: 'Missing explanation body' })
  }

  if (!rule.examples || rule.examples.length === 0) {
    errors.push({ skill, file, message: 'Missing examples' })
    return errors
  }

  const codeExamples = rule.examples.filter((example) => example.code.trim().length > 0)
  if (codeExamples.length === 0) {
    errors.push({ skill, file, message: 'No code examples found' })
    return errors
  }

  const hasBad = codeExamples.some((example) => /incorrect|wrong|bad/i.test(example.label))
  const hasGood = codeExamples.some((example) => /correct|good|usage|implementation|example/i.test(example.label))

  if (!hasBad || !hasGood) {
    errors.push({ skill, file, message: 'Need both bad and good code examples' })
  }

  const validImpacts = ['CRITICAL', 'HIGH', 'MEDIUM-HIGH', 'MEDIUM', 'LOW-MEDIUM', 'LOW']
  if (!validImpacts.includes(rule.impact)) {
    errors.push({ skill, file, message: `Invalid impact level: ${rule.impact}` })
  }

  return errors
}

async function validateSkill(skill: SkillConfig): Promise<ValidationError[]> {
  const files = await readdir(skill.rulesDir)
  const ruleFiles = files.filter((file) => file.endsWith('.md') && !file.startsWith('_') && file !== 'README.md')

  const errors: ValidationError[] = []

  for (const file of ruleFiles) {
    try {
      const { rule } = await parseRuleFile(join(skill.rulesDir, file), skill.sectionMap)
      errors.push(...validateRule(rule, skill.name, file))
    } catch (error) {
      errors.push({
        skill: skill.name,
        file,
        message: `Parse failure: ${error instanceof Error ? error.message : String(error)}`
      })
    }
  }

  if (errors.length === 0) {
    console.log(`✓ ${skill.name}: ${ruleFiles.length} rule files valid`)
  }

  return errors
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const buildAll = args.includes('--all')
  const skillArg = args.find((arg) => arg.startsWith('--skill='))
  const skillName = skillArg ? skillArg.split('=')[1] : null

  const targets: SkillConfig[] = buildAll
    ? Object.values(SKILLS)
    : skillName
      ? [SKILLS[skillName]].filter(Boolean)
      : [SKILLS[DEFAULT_SKILL]]

  if (skillName && !SKILLS[skillName]) {
    console.error(`Unknown skill: ${skillName}`)
    process.exit(1)
  }

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

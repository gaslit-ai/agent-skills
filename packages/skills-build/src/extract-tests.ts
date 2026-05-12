#!/usr/bin/env node

import { readdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { DEFAULT_SKILL, SKILLS, resolveTestCasesFile } from './config.js'
import { parseReferenceFile } from './parser.js'
import { SkillConfig, TestCase } from './types.js'

function extractTestCases(referenceId: string, referenceTitle: string, examples: any[]): TestCase[] {
  const tests: TestCase[] = []

  for (const example of examples) {
    // Word-boundary guards: `Incorrect` must not classify as `correct`.
    const isBad = /\b(incorrect|wrong|bad)\b/i.test(example.label)
    const isGood = /\b(correct|good)\b/i.test(example.label)

    if (!isBad && !isGood) {
      continue
    }

    tests.push({
      referenceId,
      referenceTitle,
      type: isBad ? 'bad' : 'good',
      code: example.code,
      language: example.language ?? 'typescript',
      description: example.description
    })
  }

  return tests
}

async function extractForSkill(skill: SkillConfig): Promise<void> {
  const files = await readdir(skill.referencesDir)
  const referenceFiles = files.filter((file) => file.endsWith('.md') && !file.startsWith('_') && file !== 'README.md')

  const allTests: TestCase[] = []

  for (const file of referenceFiles) {
    const { reference } = await parseReferenceFile(join(skill.referencesDir, file), skill.sectionMap)
    const tests = extractTestCases(reference.id || file.replace('.md', ''), reference.title, reference.examples)
    allTests.push(...tests)
  }

  const outputFile = resolveTestCasesFile(skill.name)
  await writeFile(outputFile, JSON.stringify(allTests, null, 2) + '\n', 'utf-8')
  console.log(`✓ Extracted ${allTests.length} test cases to ${outputFile}`)
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

  for (const skill of targets) {
    await extractForSkill(skill)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

#!/usr/bin/env node

import { readdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { DEFAULT_SKILL, SKILLS, resolveTestCasesFile } from './config.js'
import { parseRuleFile } from './parser.js'
import { SkillConfig, TestCase } from './types.js'

function extractTestCases(ruleId: string, ruleTitle: string, examples: any[]): TestCase[] {
  const tests: TestCase[] = []

  for (const example of examples) {
    const isBad = /incorrect|wrong|bad/i.test(example.label)
    const isGood = /correct|good/i.test(example.label)

    if (!isBad && !isGood) {
      continue
    }

    tests.push({
      ruleId,
      ruleTitle,
      type: isBad ? 'bad' : 'good',
      code: example.code,
      language: example.language ?? 'typescript',
      description: example.description
    })
  }

  return tests
}

async function extractForSkill(skill: SkillConfig): Promise<void> {
  const files = await readdir(skill.rulesDir)
  const ruleFiles = files.filter((file) => file.endsWith('.md') && !file.startsWith('_') && file !== 'README.md')

  const allTests: TestCase[] = []

  for (const file of ruleFiles) {
    const { rule } = await parseRuleFile(join(skill.rulesDir, file), skill.sectionMap)
    const tests = extractTestCases(rule.id || file.replace('.md', ''), rule.title, rule.examples)
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

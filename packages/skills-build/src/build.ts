#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { ImpactLevel, Section, SkillConfig } from './types.js'
import { parseRuleFile } from './parser.js'
import { DEFAULT_SKILL, SKILLS } from './config.js'

const args = process.argv.slice(2)
const upgradeVersion = args.includes('--upgrade-version')
const skillArg = args.find((arg) => arg.startsWith('--skill='))
const skillName = skillArg ? skillArg.split('=')[1] : null
const buildAll = args.includes('--all')

function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number)
  parts[parts.length - 1]++
  return parts.join('.')
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

function generateMarkdown(
  sections: Section[],
  metadata: {
    version: string
    organization: string
    date: string
    abstract: string
    references?: string[]
  },
  skillConfig: SkillConfig
): string {
  let md = `# ${skillConfig.title}\n\n`
  md += `**Version ${metadata.version}**  \n`
  md += `${metadata.organization}  \n`
  md += `${metadata.date}\n\n`
  md += `> **Note:**  \n`
  md += `> This guide is optimized for agents and AI-assisted engineering workflows.\n`
  md += `> It prioritizes deterministic behavior, explicit contracts, and maintainable defaults.\n\n`
  md += `---\n\n`
  md += `## Abstract\n\n`
  md += `${metadata.abstract}\n\n`
  md += `---\n\n`
  md += `## Table of Contents\n\n`

  for (const section of sections) {
    const sectionAnchor = slug(`${section.number}. ${section.title}`)
    md += `${section.number}. [${section.title}](#${sectionAnchor}) — **${section.impact}**\n`

    for (const rule of section.rules) {
      const ruleAnchor = slug(`${rule.id} ${rule.title}`)
      md += `   - ${rule.id} [${rule.title}](#${ruleAnchor})\n`
    }
  }

  md += `\n---\n\n`

  for (const section of sections) {
    md += `## ${section.number}. ${section.title}\n\n`
    md += `**Impact: ${section.impact}**\n\n`
    if (section.introduction) {
      md += `${section.introduction}\n\n`
    }

    for (const rule of section.rules) {
      md += `### ${rule.id} ${rule.title}\n\n`
      md += `**Impact: ${rule.impact}${rule.impactDescription ? ` (${rule.impactDescription})` : ''}**\n\n`
      md += `${rule.explanation}\n\n`

      for (const example of rule.examples) {
        md += `**${example.label}${example.description ? `: ${example.description}` : ''}**\n\n`
        if (example.code.trim()) {
          md += `\`\`\`${example.language ?? 'typescript'}\n${example.code}\n\`\`\`\n\n`
        }
        if (example.additionalText) {
          md += `${example.additionalText}\n\n`
        }
      }

      if (rule.references && rule.references.length > 0) {
        md += `Reference: ${rule.references
          .map((ref) => `[${ref}](${ref})`)
          .join(', ')}\n\n`
      }
    }

    md += `---\n\n`
  }

  if (metadata.references && metadata.references.length > 0) {
    md += `## References\n\n`
    metadata.references.forEach((ref, i) => {
      md += `${i + 1}. [${ref}](${ref})\n`
    })
  }

  return md
}

async function buildSkill(skillConfig: SkillConfig): Promise<void> {
  console.log(`\nBuilding ${skillConfig.name}...`)

  const files = await readdir(skillConfig.rulesDir)
  const ruleFiles = files
    .filter((file) => file.endsWith('.md') && !file.startsWith('_') && file !== 'README.md')
    .sort()

  const parsedRules = []
  for (const file of ruleFiles) {
    const parsed = await parseRuleFile(join(skillConfig.rulesDir, file), skillConfig.sectionMap)
    parsedRules.push(parsed)
  }

  const sectionsMap = new Map<number, Section>()
  for (const { section, rule } of parsedRules) {
    if (!sectionsMap.has(section)) {
      sectionsMap.set(section, {
        number: section,
        title: `Section ${section}`,
        impact: rule.impact,
        rules: []
      })
    }
    sectionsMap.get(section)!.rules.push(rule)
  }

  sectionsMap.forEach((section) => {
    section.rules.sort((a, b) => a.title.localeCompare(b.title, 'en-US', { sensitivity: 'base' }))
    section.rules.forEach((rule, idx) => {
      rule.id = `${section.number}.${idx + 1}`
      rule.subsection = idx + 1
    })
  })

  const sections = Array.from(sectionsMap.values()).sort((a, b) => a.number - b.number)

  const sectionsContent = await readFile(join(skillConfig.rulesDir, '_sections.md'), 'utf-8')
  const sectionBlocks = sectionsContent.split(/(?=^## \d+\. )/m).filter(Boolean)

  for (const block of sectionBlocks) {
    const headerMatch = block.match(/^## (\d+)\.\s+(.+?)(?:\s+\([^)]+\))?$/m)
    if (!headerMatch) {
      continue
    }

    const sectionNumber = Number.parseInt(headerMatch[1], 10)
    const sectionTitle = headerMatch[2].trim()
    const impactMatch = block.match(/\*\*Impact:\*\*\s+(\w+(?:-\w+)?)/i)
    const impactLevel = impactMatch
      ? (impactMatch[1].toUpperCase().replace(/-/g, '-') as ImpactLevel)
      : 'MEDIUM'
    const descriptionMatch = block.match(/\*\*Description:\*\*\s+(.+?)(?=\n\n##|$)/s)
    const description = descriptionMatch ? descriptionMatch[1].trim() : ''

    const section = sections.find((s) => s.number === sectionNumber)
    if (section) {
      section.title = sectionTitle
      section.impact = impactLevel
      section.introduction = description
    }
  }

  let metadata = {
    version: '0.1.0',
    organization: 'Duke Engineering',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    abstract: `Skill guidance for ${skillConfig.description}.`,
    references: [] as string[]
  }

  try {
    const content = await readFile(skillConfig.metadataFile, 'utf-8')
    metadata = JSON.parse(content)
  } catch {
    // keep fallback metadata
  }

  if (upgradeVersion) {
    const previous = metadata.version
    metadata.version = incrementVersion(previous)
    console.log(`Upgraded version ${previous} -> ${metadata.version}`)
    await writeFile(skillConfig.metadataFile, JSON.stringify(metadata, null, 2) + '\n', 'utf-8')

    const skillFile = join(skillConfig.skillDir, 'SKILL.md')
    const skillContent = await readFile(skillFile, 'utf-8')
    const updated = skillContent.replace(
      /^(---[\s\S]*?version:\s*)"[^"]*"([\s\S]*?---)$/m,
      `$1"${metadata.version}"$2`
    )
    await writeFile(skillFile, updated, 'utf-8')
  }

  const markdown = generateMarkdown(sections, metadata, skillConfig)
  await writeFile(skillConfig.outputFile, markdown, 'utf-8')

  console.log(`✓ Built ${skillConfig.outputFile}`)
}

async function main(): Promise<void> {
  if (buildAll) {
    for (const skill of Object.values(SKILLS)) {
      await buildSkill(skill)
    }
    return
  }

  if (skillName) {
    const skill = SKILLS[skillName]
    if (!skill) {
      console.error(`Unknown skill: ${skillName}`)
      process.exit(1)
    }
    await buildSkill(skill)
    return
  }

  await buildSkill(SKILLS[DEFAULT_SKILL])
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

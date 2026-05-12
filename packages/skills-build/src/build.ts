#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { ImpactLevel, Reference, Section, SkillConfig } from './types.js'
import { parseReferenceFile } from './parser.js'
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

interface SkillMetadata {
  name?: string
  description?: string
  license?: string
  allowedTools?: string
  author?: string
  version: string
  organization: string
  date: string
  abstract: string
  body?: string
  references?: string[]
}

/** Long-form AGENTS.md output — every reference expanded inline. The
 *  AGENTS.md-convention fallback for tools that don't traverse references/. */
function generateAgentsMd(
  sections: Section[],
  metadata: SkillMetadata,
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
    md += `${section.number}. [${section.title}](#${section.number}-${section.title
      .toLowerCase()
      .replace(/\s+/g, '-')}) — **${section.impact}**\n`

    for (const reference of section.references) {
      const anchor = `${reference.id} ${reference.title}`
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
      md += `   - ${reference.id} [${reference.title}](#${anchor})\n`
    }
  }

  md += `\n---\n\n`

  for (const section of sections) {
    md += `## ${section.number}. ${section.title}\n\n`
    md += `**Impact: ${section.impact}**\n\n`
    if (section.introduction) {
      md += `${section.introduction}\n\n`
    }

    for (const reference of section.references) {
      md += `### ${reference.id} ${reference.title}\n\n`
      md += `**Impact: ${reference.impact}${reference.impactDescription ? ` (${reference.impactDescription})` : ''}**\n\n`
      md += `${reference.explanation}\n\n`

      for (const example of reference.examples) {
        md += `**${example.label}${example.description ? `: ${example.description}` : ''}**\n\n`
        if (example.code.trim()) {
          md += `\`\`\`${example.language ?? 'typescript'}\n${example.code}\n\`\`\`\n\n`
        }
        if (example.additionalText) {
          md += `${example.additionalText}\n\n`
        }
      }

      if (reference.references && reference.references.length > 0) {
        md += `Reference: ${reference.references
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

/** Spec-compliant SKILL.md — frontmatter + body + per-section index that links
 *  into individual ./references/<file>.md files. Loaded into context on
 *  activation; references load on demand. */
function generateSkillMd(
  sections: Section[],
  metadata: SkillMetadata,
  skillConfig: SkillConfig,
  filenameByReference: Map<Reference, string>
): string {
  const refsFolder = skillConfig.referencesFolder

  const author = metadata.author ?? 'duke'
  const name = metadata.name ?? skillConfig.name

  let md = `---\n`
  md += `name: ${name}\n`
  md += `description: ${metadata.description ?? skillConfig.description}\n`
  if (metadata.license) {
    md += `license: ${metadata.license}\n`
  }
  if (metadata.allowedTools) {
    md += `allowed-tools: ${metadata.allowedTools}\n`
  }
  md += `metadata:\n`
  md += `  author: ${author}\n`
  md += `  version: "${metadata.version}"\n`
  md += `---\n\n`

  md += `# ${skillConfig.title}\n\n`

  if (metadata.body) {
    md += `${metadata.body}\n\n`
  }

  md += `## References\n\n`
  for (const section of sections) {
    const impact = section.impactDescription
      ? `${section.impact} — ${section.impactDescription}`
      : section.impact
    md += `### ${section.number}. ${section.title} — **${impact}**\n\n`
    if (section.introduction) {
      md += `${section.introduction}\n\n`
    }
    for (const reference of section.references) {
      const file = filenameByReference.get(reference) ?? `${reference.id}.md`
      md += `- [\`${file.replace(/\.md$/, '')}\`](./${refsFolder}/${file}) — ${reference.title}\n`
    }
    md += `\n`
  }

  md += `## Full Compiled Document\n\n`
  md += `For the complete guide with every reference expanded inline (bad/good examples, citations, prerequisites), see [\`AGENTS.md\`](./AGENTS.md). It is the [AGENTS.md-convention](https://agents.md) fallback for tools that do not load individual references on demand.\n`

  return md
}

async function buildSkill(skillConfig: SkillConfig): Promise<void> {
  console.log(`\nBuilding ${skillConfig.name}...`)

  const files = await readdir(skillConfig.referencesDir)
  const referenceFiles = files
    .filter((file) => file.endsWith('.md') && !file.startsWith('_') && file !== 'README.md')
    .sort()

  const parsed: Awaited<ReturnType<typeof parseReferenceFile>>[] = []
  for (const file of referenceFiles) {
    parsed.push(await parseReferenceFile(join(skillConfig.referencesDir, file), skillConfig.sectionMap))
  }

  const sectionsMap = new Map<number, Section>()
  const filenameByReference = new Map<Reference, string>()
  for (const { section, reference, filename } of parsed) {
    if (!sectionsMap.has(section)) {
      sectionsMap.set(section, {
        number: section,
        title: `Section ${section}`,
        impact: reference.impact,
        references: []
      })
    }
    sectionsMap.get(section)!.references.push(reference)
    filenameByReference.set(reference, filename)
  }

  sectionsMap.forEach((section) => {
    section.references.sort((a, b) => a.title.localeCompare(b.title, 'en-US', { sensitivity: 'base' }))
    section.references.forEach((reference, idx) => {
      reference.id = `${section.number}.${idx + 1}`
      reference.subsection = idx + 1
    })
  })

  const sections = Array.from(sectionsMap.values()).sort((a, b) => a.number - b.number)

  const sectionsContent = await readFile(join(skillConfig.referencesDir, '_sections.md'), 'utf-8')
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

  let metadata: SkillMetadata = {
    version: '0.1.0',
    organization: 'Duke Engineering',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    abstract: `Skill guidance for ${skillConfig.description}.`,
    references: []
  }

  try {
    const content = await readFile(skillConfig.metadataFile, 'utf-8')
    metadata = { ...metadata, ...JSON.parse(content) }
  } catch {
    // keep fallback metadata
  }

  if (upgradeVersion) {
    const previous = metadata.version
    metadata.version = incrementVersion(previous)
    console.log(`Upgraded version ${previous} -> ${metadata.version}`)
    await writeFile(skillConfig.metadataFile, JSON.stringify(metadata, null, 2) + '\n', 'utf-8')
  }

  // 1. AGENTS.md (long-form fallback)
  const agentsMd = generateAgentsMd(sections, metadata, skillConfig)
  await writeFile(skillConfig.outputFile, agentsMd, 'utf-8')
  console.log(`✓ Built ${skillConfig.outputFile}`)

  // 2. SKILL.md (spec entrypoint, always generated)
  const skillMdPath = skillConfig.skillMdFile ?? join(skillConfig.skillDir, 'SKILL.md')
  const skillMd = generateSkillMd(sections, metadata, skillConfig, filenameByReference)
  await writeFile(skillMdPath, skillMd, 'utf-8')
  console.log(`✓ Built ${skillMdPath}`)
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

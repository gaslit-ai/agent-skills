import { readFile } from 'fs/promises'
import { basename } from 'path'
import { Reference, ImpactLevel } from './types.js'

export interface ReferenceFile {
  section: number
  subsection?: number
  reference: Reference
  /** Basename of the source file (e.g. `triggers-pain-driven.md`). Used by the
   *  SKILL.md generator to emit `./references/<file>.md` links that resolve to
   *  the file each reference actually came from, irrespective of post-parse sorting. */
  filename: string
}

export async function parseReferenceFile(
  filePath: string,
  sectionMap: Record<string, number>
): Promise<ReferenceFile> {
  const rawContent = await readFile(filePath, 'utf-8')
  const content = rawContent.replace(/\r\n/g, '\n')

  let frontmatter: Record<string, string> = {}
  let contentStart = 0

  if (content.startsWith('---')) {
    const frontmatterEnd = content.indexOf('---', 3)
    if (frontmatterEnd !== -1) {
      const frontmatterText = content.slice(3, frontmatterEnd).trim()
      frontmatterText.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split(':')
        if (!key || valueParts.length === 0) {
          return
        }
        const value = valueParts.join(':').trim()
        frontmatter[key.trim()] = value.replace(/^['"]|['"]$/g, '')
      })
      contentStart = frontmatterEnd + 3
    }
  }

  const bodyLines = content.slice(contentStart).trim().split('\n')
  let title = ''
  let titleLine = 0

  for (let i = 0; i < bodyLines.length; i++) {
    if (bodyLines[i].startsWith('##')) {
      title = bodyLines[i].replace(/^##+\s*/, '').trim()
      titleLine = i
      break
    }
  }

  let impact: Reference['impact'] = 'MEDIUM'
  let impactDescription = ''
  let explanation = ''
  let citations: string[] = []
  const examples: Reference['examples'] = []

  let currentExample: Reference['examples'][number] | null = null
  let inCodeBlock = false
  let codeBlockLanguage = 'typescript'
  let codeBlockContent: string[] = []
  let afterCodeBlock = false
  let additionalText: string[] = []
  let hasCodeBlockForCurrentExample = false
  let inReferencesList = false

  const extractUrls = (line: string): string[] => {
    const matches = line.match(/\[([^\]]+)\]\(([^)]+)\)/g) ?? []
    return matches
      .map((m) => {
        const inner = m.match(/\[([^\]]+)\]\(([^)]+)\)/)
        return inner ? inner[2] : ''
      })
      .filter(Boolean)
  }

  for (let i = titleLine + 1; i < bodyLines.length; i++) {
    const line = bodyLines[i]

    if (line.includes('**Impact:')) {
      const match = line.match(/\*\*Impact:\s*(\w+(?:-\w+)?)\s*(?:\(([^)]+)\))?/i)
      if (match) {
        impact = match[1].toUpperCase().replace(/-/g, '-') as ImpactLevel
        impactDescription = match[2] ?? ''
      }
      continue
    }

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        if (currentExample) {
          currentExample.code = codeBlockContent.join('\n')
          currentExample.language = codeBlockLanguage
        }
        inCodeBlock = false
        codeBlockContent = []
        afterCodeBlock = true
      } else {
        inCodeBlock = true
        hasCodeBlockForCurrentExample = true
        codeBlockLanguage = line.slice(3).trim() || 'typescript'
        codeBlockContent = []
        afterCodeBlock = false
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    // Labels are bold lines that end with `:**` (optionally with trailing whitespace).
    // The captured group can contain anything (including colons in URLs inside
    // markdown links), so we use `.+?` and anchor on `:\*\*$`.
    const labelMatch = line.match(/^\*\*(.+?):\*\*\s*$/)
    if (labelMatch) {
      if (currentExample) {
        if (additionalText.length > 0) {
          currentExample.additionalText = additionalText.join('\n\n')
          additionalText = []
        }
        examples.push(currentExample)
      }

      const fullLabel = labelMatch[1].trim()
      // Strip parenthesized description; the inner group allows nested parens so that
      // markdown links inside the description (e.g. `[txt](https://...)`) don't break parsing.
      const descMatch = fullLabel.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)*)\s*\((.+)\)$/)
      currentExample = {
        label: descMatch ? descMatch[1].trim() : fullLabel,
        description: descMatch ? descMatch[2].trim() : undefined,
        code: '',
        language: codeBlockLanguage
      }
      afterCodeBlock = false
      hasCodeBlockForCurrentExample = false
      continue
    }

    if (line.startsWith('Reference:') || line.startsWith('References:')) {
      if (currentExample) {
        if (additionalText.length > 0) {
          currentExample.additionalText = additionalText.join('\n\n')
          additionalText = []
        }
        examples.push(currentExample)
        currentExample = null
      }

      const inlineUrls = extractUrls(line)
      if (inlineUrls.length > 0) {
        citations.push(...inlineUrls)
      }
      inReferencesList = true
      continue
    }

    if (inReferencesList) {
      const trimmed = line.trim()
      if (trimmed === '') {
        continue
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const urls = extractUrls(trimmed)
        if (urls.length > 0) {
          citations.push(...urls)
          continue
        }
      }
      inReferencesList = false
    }

    if (line.trim() && !line.startsWith('#')) {
      if (!currentExample) {
        explanation += (explanation ? '\n\n' : '') + line
      } else if (afterCodeBlock || !hasCodeBlockForCurrentExample) {
        additionalText.push(line)
      }
    }
  }

  if (currentExample) {
    if (additionalText.length > 0) {
      currentExample.additionalText = additionalText.join('\n\n')
    }
    examples.push(currentExample)
  }

  const filename = basename(filePath)
  const filenameParts = filename.replace('.md', '').split('-')

  let section = 0
  for (let len = filenameParts.length; len > 0; len--) {
    const prefix = filenameParts.slice(0, len).join('-')
    if (sectionMap[prefix] !== undefined) {
      section = sectionMap[prefix]
      break
    }
  }

  const reference: Reference = {
    id: '',
    title: frontmatter.title || title,
    section,
    impact: (frontmatter.impact as ImpactLevel) || impact,
    impactDescription: frontmatter.impactDescription || impactDescription,
    explanation: explanation.trim(),
    examples,
    references: citations,
    tags: frontmatter.tags
      ? frontmatter.tags.split(',').map((tag) => tag.trim())
      : undefined
  }

  return { section, subsection: 0, reference, filename }
}

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd())
const read = (file: string) => readFileSync(resolve(root, file), 'utf8')

describe('static site nav', () => {
  it('links to Auntie Kim Dates from the deployed pages', () => {
    const files = ['portfolio.html', 'contact.html']
    for (const file of files) {
      const html = read(file)
      expect(html).toContain('https://dashinja.github.io/auntieKimDates/')
    }
  })

  it('does not include theme and help controls on the deployed pages', () => {
    for (const file of ['index.html', 'portfolio.html', 'contact.html']) {
      const html = read(file)
      expect(html).not.toContain('data-theme-toggle')
      expect(html).not.toContain('data-target="#siteHelpModal"')
      expect(html).not.toContain('id="siteHelpModal"')
      expect(html).not.toContain('How this site works')
    }
  })
})

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd())
const read = (file: string) => readFileSync(resolve(root, file), 'utf8')
const htmlFiles = ['index.html', 'portfolio.html', 'contact.html']
const sourceFiles = [
  ...htmlFiles,
  'src/app/page.tsx',
  'src/app/portfolio/page.tsx',
  'portfolio-next/src/components/Navigation.tsx',
]

function listFiles(dir: string): string[] {
  return readdirSync(resolve(root, dir)).flatMap((entry) => {
    const relativePath = `${dir}/${entry}`
    const absolutePath = resolve(root, relativePath)
    return statSync(absolutePath).isDirectory() ? listFiles(relativePath) : [relativePath]
  })
}

describe('static site nav', () => {
  it('links to Auntie Kim Dates from the deployed pages', () => {
    for (const file of htmlFiles) {
      const html = read(file)
      expect(html).toContain('https://dashinja.github.io/auntieKimDates/')
    }
  })

  it('does not include theme and help controls on the deployed pages', () => {
    for (const file of htmlFiles) {
      const html = read(file)
      expect(html).not.toContain('data-theme-toggle')
      expect(html).not.toContain('data-target="#siteHelpModal"')
      expect(html).not.toContain('id="siteHelpModal"')
      expect(html).not.toContain('How this site works')
    }
  })

  it('protects every new-tab link from opener and referrer leakage', () => {
    for (const file of sourceFiles) {
      const source = read(file)
      const anchors = source.match(/<(a|Link)\b[\s\S]*?>/g) ?? []
      const blankAnchors = anchors.filter((anchor) => anchor.includes('target="_blank"'))

      for (const anchor of blankAnchors) {
        expect(anchor).toContain('rel="noopener noreferrer"')
      }
    }
  })

  it('uses first-party navbar JavaScript instead of legacy CDN scripts', () => {
    for (const file of htmlFiles) {
      const html = read(file)
      expect(html).toContain('<script src="./assets/js/navbar-toggle.js"></script>')
      expect(html).not.toMatch(/<script\s+src="https:\/\//)
      expect(html).not.toContain('jquery')
      expect(html).not.toContain('popper')
      expect(html).not.toContain('bootstrap.min.js')
    }
  })

  it('declares browser security policies on deployed pages', () => {
    for (const file of htmlFiles) {
      const html = read(file)
      expect(html).toContain('name="referrer" content="strict-origin-when-cross-origin"')
      expect(html).toContain('http-equiv="Content-Security-Policy"')
      expect(html).toContain("object-src 'none'")
      expect(html).toContain("base-uri 'self'")
    }
  })

  it('does not publish obsolete resume documents or metadata sidecars', () => {
    const documents = listFiles('assets/documents')

    expect(documents).toEqual(['assets/documents/Byron_Miller_Resume_vc_techOnly_vari_ec_2024_03_18.docx'])
    expect(documents.some((file) => file.includes('/obsolete/'))).toBe(false)
    expect(documents.some((file) => file.includes(':'))).toBe(false)
  })

  it('uses explicit referrer controls for external images', () => {
    const externalImages = read('portfolio.html')
      .match(/<img\b[\s\S]*?>/g)
      ?.filter((image) => image.includes('src="https://')) ?? []

    for (const image of externalImages) {
      expect(image).toContain('referrerpolicy="no-referrer"')
    }
  })
})

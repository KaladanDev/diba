import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Text } from './Text'

describe('Text', () => {
  it('renders its content', () => {
    render(<Text>سلام دنیا</Text>)
    expect(screen.getByText('سلام دنیا')).toBeInTheDocument()
  })

  it('renders as the requested element (polymorphic)', () => {
    render(
      <Text as="h1" size="3xl">
        عنوان
      </Text>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'عنوان' })).toBeInTheDocument()
  })

  it('carries its tone and size through to its own classes', () => {
    render(
      <Text tone="primary" size="lg" data-testid="t">
        x
      </Text>,
    )
    const el = screen.getByTestId('t')
    expect(el.className).toContain('db-text--primary')
    expect(el.className).toContain('db-text--lg')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Text as="p">پاراگراف نمونه</Text>)
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})

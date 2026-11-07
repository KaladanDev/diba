import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stack } from './Stack'

describe('Stack', () => {
  it('renders its children', () => {
    render(
      <Stack>
        <span>a</span>
        <span>b</span>
      </Stack>,
    )
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
  })

  it('is a flex container with the requested direction + gap', () => {
    render(
      <Stack direction="horizontal" gap={6} data-testid="s">
        <span>a</span>
      </Stack>,
    )
    const el = screen.getByTestId('s')
    expect(el.className).toContain('db-stack')
    expect(el.className).toContain('db-stack--horizontal')
    expect(el.className).toContain('db-stack--gap-6')
  })
})

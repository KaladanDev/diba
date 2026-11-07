import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchField } from '../../index'

/**
 * The copied SearchField as Diba exports it, composed as admin-web composes all of its own:
 * a group holding the search icon, the input and the clear button.
 */
function Search(props: Partial<React.ComponentProps<typeof SearchField>>) {
  return (
    <SearchField aria-label="جستجو در محصولات" {...props}>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="جستجو در محصولات" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  )
}

describe('SearchField', () => {
  it('is a search box with the classes the stylesheet keys on', () => {
    const { container } = render(<Search />)
    const input = screen.getByRole('searchbox', { name: 'جستجو در محصولات' })
    expect(input).toHaveClass('search-field__input')
    expect(container.querySelector('.search-field__group')).not.toBeNull()
    expect(container.querySelector('.search-field__search-icon')).not.toBeNull()
  })

  it('reports what is typed, and submits on Enter', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const onSubmit = vi.fn()
    render(<Search onChange={onChange} onSubmit={onSubmit} />)
    await user.type(screen.getByRole('searchbox'), 'شال{Enter}')
    expect(onChange).toHaveBeenLastCalledWith('شال')
    expect(onSubmit).toHaveBeenCalledWith('شال')
  })

  it('clears with its button and with Escape', async () => {
    const user = userEvent.setup()
    const onClear = vi.fn()
    render(<Search defaultValue="شال" onClear={onClear} />)
    const input = screen.getByRole('searchbox')
    await user.click(screen.getByRole('button'))
    expect(input).toHaveValue('')
    expect(onClear).toHaveBeenCalledTimes(1)

    await user.type(input, 'کیف')
    await user.keyboard('{Escape}')
    expect(input).toHaveValue('')
    expect(onClear).toHaveBeenCalledTimes(2)
  })
})

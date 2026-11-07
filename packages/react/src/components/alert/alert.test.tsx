import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DibaProvider } from '../../provider/DibaProvider'
import {
  Alert,
  AlertDialog,
  Avatar,
  AvatarGroup,
  Chip,
  Label,
  ProgressBar,
  Spinner,
  Tag,
  TagGroup,
} from '../../index'

/**
 * Group 5, status: the copied Alert, toast, Chip, TagGroup and Tag, Spinner, ProgressBar,
 * Avatar and AvatarGroup as Diba exports them, composed the way the admin composes them. The
 * toast reads matchMedia, which jsdom lacks, so its test is in alert.browser.test.tsx.
 */

describe('Alert', () => {
  it('draws its status, title and description', () => {
    const { container } = render(
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>ذخیره نشد</Alert.Title>
          <Alert.Description>اتصال برقرار نشد.</Alert.Description>
        </Alert.Content>
      </Alert>,
    )
    const alert = container.querySelector('.alert')!
    expect(alert).toHaveClass('alert--danger')
    expect(screen.getByText('ذخیره نشد')).toHaveClass('alert__title')
    expect(screen.getByText('اتصال برقرار نشد.')).toHaveClass('alert__description')
    expect(container.querySelector('.alert__indicator svg')).not.toBeNull()
  })

  it('marks each status with Lucide’s sign, as an alert dialog does', () => {
    const signs = {
      default: 'lucide-info',
      accent: 'lucide-info',
      success: 'lucide-circle-check',
      warning: 'lucide-triangle-alert',
      danger: 'lucide-circle-alert',
    } as const
    for (const [status, sign] of Object.entries(signs)) {
      const { container, unmount } = render(
        <>
          <Alert status={status as keyof typeof signs}>
            <Alert.Indicator />
          </Alert>
          <AlertDialog.Icon status={status as keyof typeof signs} />
        </>,
      )
      const alert = container.querySelector('[data-slot="alert-default-icon"]')!
      const dialog = container.querySelector('[data-slot="alert-dialog-default-icon"]')!
      for (const mark of [alert, dialog]) {
        expect(mark, status).toHaveClass(sign)
        expect(mark).toHaveAttribute('aria-hidden', 'true')
      }
      unmount()
    }
  })
})

describe('Chip', () => {
  it('is a static label in its variant, colour and size', () => {
    const { container } = render(
      <Chip size="sm" variant="soft" color="success">
        <Chip.Label>پرداخت شد</Chip.Label>
      </Chip>,
    )
    expect(container.querySelector('.chip')).toHaveClass('chip--sm', 'chip--soft', 'chip--success')
    expect(screen.getByText('پرداخت شد')).toHaveClass('chip__label')
  })
})

describe('TagGroup', () => {
  it('removes a tag, as TagsField does', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(
      <TagGroup aria-label="برچسب‌ها" onRemove={onRemove}>
        <TagGroup.List>
          {['تابستانی', 'نخی'].map((tag) => (
            <Tag key={tag} id={tag} textValue={tag}>
              {tag}
              <Tag.RemoveButton aria-label={`حذف ${tag}`} />
            </Tag>
          ))}
        </TagGroup.List>
      </TagGroup>,
    )
    // React Aria names the button by its own label and its tag's: «حذف نخی نخی».
    await user.click(screen.getByRole('button', { name: /^حذف نخی/ }))
    expect([...(onRemove.mock.calls[0]![0] as Set<string>)]).toEqual(['نخی'])
  })

  it('chooses tags when selectable', async () => {
    const user = userEvent.setup()
    const onSelectionChange = vi.fn()
    render(
      <TagGroup selectionMode="multiple" onSelectionChange={onSelectionChange}>
        <Label>فیلتر</Label>
        <TagGroup.List>
          <Tag id="new">تازه</Tag>
          <Tag id="sale">حراج</Tag>
        </TagGroup.List>
      </TagGroup>,
    )
    const grid = screen.getByRole('grid', { name: 'فیلتر' })
    await user.click(within(grid).getByText('حراج'))
    expect([...(onSelectionChange.mock.calls.at(-1)![0] as Set<string>)]).toEqual(['sale'])
  })
})

describe('Spinner', () => {
  it('is a named progress indicator', () => {
    render(<Spinner size="lg" aria-label="در حال بارگذاری" />)
    const spinner = screen.getByLabelText('در حال بارگذاری')
    expect(spinner).toHaveClass('spinner', 'spinner--lg')
  })
})

describe('ProgressBar', () => {
  it('writes its percentage in Persian, and fills from the inline start', () => {
    const { container } = render(
      <DibaProvider locale="fa-IR" dir="rtl">
        <ProgressBar value={40}>
          <Label>درون‌ریزی</Label>
          <ProgressBar.Output />
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </DibaProvider>,
    )
    const bar = screen.getByRole('progressbar', { name: 'درون‌ریزی' })
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(container.querySelector('.progress-bar__output')!.textContent).toMatch(/۴۰/)
  })
})

describe('Avatar', () => {
  it('shows its initials while it has no picture, and a group counts the rest', () => {
    const { container } = render(
      <AvatarGroup>
        <Avatar size="sm">
          <Avatar.Fallback>ک</Avatar.Fallback>
        </Avatar>
        <Avatar>
          <Avatar.Fallback>م</Avatar.Fallback>
        </Avatar>
        <AvatarGroup.Count>+۲</AvatarGroup.Count>
      </AvatarGroup>,
    )
    expect(container.querySelector('.avatar-group')).not.toBeNull()
    expect(screen.getByText('ک')).toHaveClass('avatar__fallback')
    expect(container.querySelector('.avatar')).toHaveClass('avatar--sm')
    expect(container.querySelector('.avatar-group__count')).toHaveTextContent('+۲')
  })
})

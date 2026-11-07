import { describe, it, expect, afterEach } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { DibaProvider, type DibaTheme } from '../../provider/DibaProvider'
import { Input, TextField } from '../../index'
import { contrast, settled } from '../../test/visual'

/**
 * A field's placeholder holds 4.5:1 on its own fill, as Flutter's does: on a page's field and on a
 * secondary field's second surface, in both themes. Slate-400 had been 2.6:1 on a white field and
 * slate-500 3.7:1 on dark's.
 */

afterEach(cleanup)

describe('a placeholder can be read', () => {
  for (const theme of ['light', 'dark'] as DibaTheme[]) {
    for (const variant of ['primary', 'secondary'] as const) {
      it(`${theme} ${variant}: 4.5:1 or more on the field`, async () => {
        render(
          <DibaProvider theme={theme} locale="fa-IR" dir="rtl">
            <TextField aria-label="نام" variant={variant}>
              <Input placeholder="نیلوفر" />
            </TextField>
          </DibaProvider>,
        )
        await settled(60)
        const input = document.querySelector<HTMLInputElement>('input')!
        const ink = getComputedStyle(input, '::placeholder').color
        const fill = getComputedStyle(input).backgroundColor
        expect(contrast(ink, fill)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

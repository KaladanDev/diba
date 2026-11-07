/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite'
import { DibaProvider, type DibaDir, type DibaTheme } from '../src'
import copySheet from '../src/styles/index.css?inline'

/**
 * The stylesheet, put on the page as text with the docs' own fixes after it, so a fix can win over
 * a component's rule without a second build.
 */
function applyStylesheet() {
  let tag = document.getElementById('diba-stylesheet')
  if (!tag) {
    tag = document.createElement('style')
    tag.id = 'diba-stylesheet'
    document.head.append(tag)
  }
  const css = copySheet + docsFixes
  if (tag.textContent !== css) tag.textContent = css
}

/**
 * Prism names a JSX tag's token `tag`, which is the Tag component's class too, so in a docs page's code
 * every `<Accordion>` took a tag chip's padding and flex. In code it is a word again.
 */
const docsFixes = `
/* Storybook is the app here, so it sets the faces Diba's tokens name, as an app does. */
.db-root:lang(fa) {
  font-family: var(--db-font-family-fa);
}
.db-root:lang(en) {
  font-family: var(--db-font-family-sans);
}
pre .token.tag {
  display: inline !important;
  padding: 0 !important;
  margin: 0 !important;
  height: auto !important;
  min-height: 0 !important;
  width: auto !important;
  min-width: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: none !important;
  gap: 0 !important;
  font: inherit !important;
  box-shadow: none !important;
  transform: none !important;
  opacity: 1 !important;
}
`

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      // The components first, each a docs page and its stories, as an app builds with them; then
      // the patterns they are composed into; then the foundations they all draw on; then the SDUI
      // renderer. Each page's docs before its stories.
      storySort: {
        order: [
          'Components',
          ['*', ['*', ['Docs', '*']]],
          'Patterns',
          ['*', ['Docs', '*']],
          'Foundations',
          [
            'Colors',
            ['Docs', '*'],
            'Typography',
            ['Docs', '*'],
            'Spacing and shape',
            ['Docs', '*'],
            'Motion',
            ['Docs', '*'],
            'Direction and language',
            ['Docs', '*'],
            'Theming',
            ['Docs', '*'],
            '*',
            ['Docs', '*'],
          ],
          'SDUI',
          [
            'Introduction',
            ['Docs', '*'],
            'Trees',
            ['Docs', '*'],
            'Actions and state',
            ['Docs', '*'],
            'Safety',
            ['Docs', '*'],
            'Extensions',
            ['Docs', '*'],
            'Blocks',
            ['Docs', '*'],
            '*',
            ['Docs', '*'],
          ],
          '*',
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Token theme',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'rtl', title: 'RTL' },
          { value: 'ltr', title: 'LTR' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Locale',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'fa-IR', title: 'فارسی' },
          { value: 'en-US', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    dir: 'rtl',
    locale: 'fa-IR',
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme as DibaTheme
      const dir = context.globals.dir as DibaDir
      const locale = context.globals.locale as string
      applyStylesheet()
      return (
        <DibaProvider
          theme={theme}
          dir={dir}
          locale={locale}
          // A docs page draws many stories; each is as tall as it is, not the window, and turns
          // its own canvas, not the page: the docs are English, left to right.
          ownsDocument={context.viewMode !== 'docs'}
          className={context.viewMode === 'docs' ? 'rounded-xl p-6' : 'min-h-screen p-8'}
          // The page and its ink, as an app's page has them, so a surface's paper is not lost on a
          // white canvas.
          style={{ background: 'var(--background)', color: 'var(--foreground)' }}
        >
          <Story />
        </DibaProvider>
      )
    },
  ],
}

export default preview

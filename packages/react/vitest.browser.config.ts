import { defineConfig } from 'vitest/config'
import type { BrowserCommand } from 'vitest/node'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * The real mouse, at a point in the test's own frame: moved there, pressed or released. What a
 * pointer meets is what the page's hit testing and `:hover` and `:active` say, which
 * `userEvent` cannot press and hold (choice.browser tests).
 */
const pointer: BrowserCommand<[x: number, y: number, action: 'move' | 'down' | 'up']> = async (
  ctx,
  x,
  y,
  action,
) => {
  if (ctx.provider.name !== 'playwright') throw new Error('pointer needs the playwright provider')
  const frame = await (await ctx.frame()).frameElement()
  const at = (await frame.boundingBox())!
  // The runner scales the test's frame down to fit its window.
  const scale = at.width / (await frame.evaluate((el) => (el as HTMLElement).offsetWidth))
  const mouse = ctx.page.mouse
  await mouse.move(at.x + x * scale, at.y + y * scale)
  if (action === 'down') await mouse.down()
  if (action === 'up') await mouse.up()
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    restoreMocks: true,
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
      // Vitest's default, 63315, sometimes falls inside a range Windows reserves for Hyper-V after
      // a restart, and listening there fails with EACCES. VITEST_BROWSER_PORT picks another.
      api: { port: Number(process.env.VITEST_BROWSER_PORT) || 63315 },
      commands: { pointer },
    },
    include: ['src/**/*.browser.test.{ts,tsx}'],
    // The real stylesheet, compiled by Tailwind: the copy's, with Diba's tokens and theme.
    setupFiles: ['./src/test/browser-setup.ts'],
  },
})

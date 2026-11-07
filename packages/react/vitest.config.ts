import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // The browser suite has its own config and needs a real engine.
    exclude: ['**/node_modules/**', 'src/**/*.browser.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
})

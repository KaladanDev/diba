import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * The whole point of this suite: the real stylesheet, compiled by Tailwind, with Diba's token
 * variables and Diba's theme over the default one — what an app loads as `tailwind.css`.
 * Without this import the browser suite would be an expensive jsdom.
 */
import '../styles/index.css'

afterEach(() => {
  cleanup()
})

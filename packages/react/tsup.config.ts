import { defineConfig } from 'tsup'

export default defineConfig({
  // `variants` is the style recipes alone, with no React in it, so a server component can call
  // `buttonVariants()` without crossing into client code.
  entry: ['src/index.ts', 'src/sdui/index.ts', 'src/variants.ts'],
  format: ['esm'],
  // Node's types for the declaration build only: the copied `utils/dom.tsx` reads
  // `process.env.NODE_ENV` for a development warning. Nothing of Node reaches the emitted types.
  dts: { compilerOptions: { types: ['node'] } },
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-aria-components'],
})

import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (cfg) => {
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    cfg.plugins = cfg.plugins ?? []
    cfg.plugins.push(tailwindcss())
    return cfg
  },
}

export default config

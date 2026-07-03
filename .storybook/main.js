/** @type { import('@storybook/html-vite').StorybookConfig } */
export default {
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-a11y'],
  framework: { name: '@storybook/html-vite', options: {} },
  // Serve the real site assets at /assets so product/frame stories use the
  // actual imagery, and stories render exactly like the live site.
  staticDirs: [{ from: '../assets', to: '/assets' }],
};

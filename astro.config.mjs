import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://shtobar.dev',
  integrations: [preact(), tailwind({ config: { applyBaseStyles: false } })],
});

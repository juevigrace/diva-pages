import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { port: 4322 },
  integrations: [react(), sitemap()],
  vite: {
    ssr: { noExternal: ['diva-ui'] },
    plugins: [tailwindcss(), visualizer({ emitFile: true })],
  },
});

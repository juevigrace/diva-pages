import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  site: 'https://example.com/app',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [
      tailwindcss(),
      visualizer({ emitFile: true }),
    ],
  },
});

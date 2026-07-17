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
  session: {
    cookie: {
      maxAge: 86400,
    },
    ttl: 86400,
  },
  integrations: [react(), sitemap({ namespaces: { news: false, image: false, video: false } })],
  env: {
    schema: {
      API_BASE_URL: {
        type: 'string',
        default: 'http://localhost:5001',
        context: 'server',
        access: 'public',
      },
    },
  },
  vite: {
    ssr: { noExternal: ['diva-ui'] },
    plugins: [tailwindcss(), visualizer({ emitFile: true })],
  },
});

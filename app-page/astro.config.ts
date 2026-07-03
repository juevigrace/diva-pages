import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://example.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
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
    resolve: {
      alias: {
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@actions': path.resolve(__dirname, 'src/actions'),
        '@styles': path.resolve(__dirname, 'src/styles'),
      },
    },
  },
});

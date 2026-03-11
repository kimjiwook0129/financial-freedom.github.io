import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://financial-freedom.github.io',
  integrations: [tailwind()],
});

import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://kimjiwook0129.github.io',
  base: '/financial-freedom.github.io',
  integrations: [tailwind()],
});

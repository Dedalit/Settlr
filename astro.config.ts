// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import cloudflare from "@astrojs/cloudflare";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",

  // No sessions are used; prevents automatic KV provisioning on deploy.
  session: false,

  adapter: cloudflare({
    // The app doesn't use Astro's image pipeline; avoid provisioning an Images binding.
    imageService: 'passthrough',
  }),

  vite: {
    plugins: [tailwindcss()],
  },
});

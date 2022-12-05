import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";
import solidJs from "@astrojs/solid-js";

export default defineConfig({
  integrations: [svelte(), solidJs()],
  output: 'server',
});
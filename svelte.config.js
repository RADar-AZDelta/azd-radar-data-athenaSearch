import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

const dev = process.argv.includes('dev')

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    paths: {
      base: dev ? '' : '/svelte-Athena-search',
    },
    alias: {
      "@radar-azdelta/svelte-datatable": "libs/azd-radar-dev-datatable/src/lib"
    },
    prerender: {
      handleHttpError: 'warn',
    },
  },
}

export default config

import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, searchForWorkspaceRoot } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  resolve: {
    alias: {
      '@radar-azdelta/svelte-datatable': path.resolve(__dirname, './libs/azd-radar-dev-datatable/src/lib')
    }
  },
  server: {
    fs: {
      allow: [
        // search up for workspace root
        searchForWorkspaceRoot(process.cwd()),
        // your custom rules
      ],
    },
  }
})

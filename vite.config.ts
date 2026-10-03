import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Component tests opt into jsdom with a `@vitest-environment jsdom` comment.
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
})

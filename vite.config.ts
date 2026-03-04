/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // E2E 測試由 Playwright 執行，不納入 Vitest
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      exclude: [
        // Build/lint config files
        'postcss.config.js',
        'tailwind.config.js',
        'eslint.config.js',
        'vite.config.ts',
        // App entry & infrastructure (not unit-testable in isolation)
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/app/App.tsx',
        'src/app/providers.tsx',
        'src/app/router.tsx',
        // Type-only files (no runtime code)
        'src/auth/auth.types.ts',
        'src/domains/users/users.types.ts',
        'src/shared/api/types.ts',
        'src/types/common.ts',
        'src/types/global.d.ts',
        // Test infrastructure
        'src/shared/mocks/**',
        'src/test/**',
        // Build output (not source)
        'dist/**',
      ],
    },
  },
})

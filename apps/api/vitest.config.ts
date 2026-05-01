import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '*.config.ts',
        '**/*.d.ts',
        'src/tests/',
        'src/index.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@services': path.resolve(__dirname, './src/services'),
      '@controllers': path.resolve(__dirname, './src/controllers'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@middlewares': path.resolve(__dirname, './src/middlewares'),
      '@types': path.resolve(__dirname, './src/types')
    }
  }
})
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/migrations/',
        'src/scripts/',
      ],
      thresholds: {
        lines: 80, // 80% coverage per constitution
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 5000, // <5s for unit tests per constitution
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@models': path.resolve(__dirname, './src/models'),
      '@services': path.resolve(__dirname, './src/services'),
      '@api': path.resolve(__dirname, './src/api'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@jobs': path.resolve(__dirname, './src/jobs'),
    },
  },
});

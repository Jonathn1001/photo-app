import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['src/**/*.test.ts', 'src/tests/**/*.test.ts'], environment: 'node', testTimeout: 10000, fileParallelism: false },
});

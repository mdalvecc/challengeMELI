import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['tests/tsconfig.json'] })],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    globals: true,
    reporters: 'default',
    coverage: {
      enabled: false,
    },
  },
  resolve: {
    alias: [
      { find: '@app', replacement: path.resolve(__dirname, 'src') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
      { find: '@graphql', replacement: path.resolve(__dirname, 'src/graphql') },
      { find: '@graphql/generated', replacement: path.resolve(__dirname, 'src/graphql/generated') },
      { find: '@app-types', replacement: path.resolve(__dirname, 'src/types') },
    ],
  },
});

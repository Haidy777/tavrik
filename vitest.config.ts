import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./src/lib/env.ts'],
    pool: 'forks',
    execArgv: ['--import', 'tsx/esm'],
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['**/*.test.unit.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'database',
          include: ['**/*.test.database.ts'],
        },
      },
    ],
  },
})

import { defineConfig } from 'kysely-codegen'

export default defineConfig({
  camelCase: true,
  defaultSchemas: ['public'],
  includePattern: '*.*',
  envFile: '../../.env',
  outFile: './database/generated.ts',
})

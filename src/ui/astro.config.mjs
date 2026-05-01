import node from '@astrojs/node'
import { defineConfig } from 'astro/config'
import dbMigrate from './src/integrations/db-migrate.ts'
import modelLoader from './src/integrations/model-loader.ts'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [dbMigrate(), modelLoader()],
})

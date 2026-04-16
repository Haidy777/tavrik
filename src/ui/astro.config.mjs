import node from '@astrojs/node'
import { defineConfig } from 'astro/config'
import dbMigrate from './src/integrations/db-migrate.ts'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [dbMigrate()],
})

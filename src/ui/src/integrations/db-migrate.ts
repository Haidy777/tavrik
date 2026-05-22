import { migrateToLatest } from '@tavrik/core/database'
import type { AstroIntegration } from 'astro'

export default function dbMigrate(): AstroIntegration {
  return {
    name: 'db-migrate',
    hooks: {
      'astro:server:start': async () => {
        await migrateToLatest()
      },
    },
  }
}

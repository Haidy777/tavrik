import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely'
import pg from 'pg'
import { ENV_CONFIG } from '../env.js'
import type { DB } from './overrides.js'

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: ENV_CONFIG.DATABASE_URL,
  }),
})

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
})

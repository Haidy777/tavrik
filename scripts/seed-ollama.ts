import '../src/core/env.js'
import { db, migrateToLatest } from '../src/core/database/index.js'
import { moduleLogger } from '../src/core/logger.js'

const logger = moduleLogger('seed-ollama')

async function main() {
  await migrateToLatest()

  const existing = await db
    .selectFrom('provider.providers')
    .select('id')
    .where('name', '=', 'Ollama')
    .executeTakeFirst()

  if (existing) {
    logger.info({ providerId: existing.id }, 'Ollama provider already exists')
  } else {
    const result = await db
      .insertInto('provider.providers')
      .values({
        type: 'openai-compatible',
        name: 'Ollama',
        endpoint: 'http://localhost:11434/v1',
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    logger.info({ providerId: result.id }, 'Ollama provider seeded')
  }

  await db.destroy()
}

main().catch((err) => {
  logger.fatal(err)
  process.exit(1)
})

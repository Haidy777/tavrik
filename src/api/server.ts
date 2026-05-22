import { migrateToLatest } from '@tavrik/core/database'
import { ENV_CONFIG } from '@tavrik/core/env'
import { logger } from '@tavrik/core/logger'
import { loadAndStoreAvailableModel } from '@tavrik/core/provider'
import { buildApp } from './app.js'

const PORT = ENV_CONFIG.API_PORT
const HOST = ENV_CONFIG.API_HOST

async function start() {
  await migrateToLatest()
  await loadAndStoreAvailableModel()

  const app = await buildApp()
  await app.listen({ port: PORT, host: HOST })
  logger.info({ port: PORT, host: HOST }, 'API server started')
}

start().catch((err) => {
  logger.fatal(err, 'Failed to start API server')
  process.exit(1)
})

import { ENV_CONFIG } from '@tavrik/core/env'
import { logger } from '@tavrik/core/logger'
import { buildApp } from './app.js'

const PORT = ENV_CONFIG.API_PORT
const HOST = ENV_CONFIG.API_HOST

async function start() {
  const app = await buildApp()
  await app.listen({ port: PORT, host: HOST })
  logger.info({ port: PORT, host: HOST }, 'API server started')
}

start().catch((err) => {
  logger.fatal(err, 'Failed to start API server')
  process.exit(1)
})

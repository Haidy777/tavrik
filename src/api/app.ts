import { logger } from '@tavrik/core/logger'
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { registerErrorHandler } from './plugins/error-handler.js'
import { registerSwagger } from './plugins/swagger.js'
import { conversationRoutes } from './routes/conversations/index.js'
import { healthRoutes } from './routes/health.js'
import { indexRoutes } from './routes/index.js'
import { memoryRoutes } from './routes/memory/index.js'
import { personaRoutes } from './routes/personas/index.js'
import { providerRoutes } from './routes/providers/index.js'
import { settingRoutes } from './routes/system/settings/index.js'

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await registerSwagger(app)
  registerErrorHandler(app)

  await app.register(healthRoutes)
  await app.register(indexRoutes)
  await app.register(
    async (api) => {
      await api.register(conversationRoutes, { prefix: '/conversations' })
      await api.register(memoryRoutes, { prefix: '/memory' })
      await api.register(providerRoutes, { prefix: '/providers' })
      await api.register(personaRoutes, { prefix: '/personas' })
      await api.register(settingRoutes, { prefix: '/system/settings' })
    },
    { prefix: '/api/v1' }
  )

  return app
}

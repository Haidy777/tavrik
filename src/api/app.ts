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
import { messageRoutes } from './routes/messages/index.js'
import { modelRoutes } from './routes/models/index.js'
import { personaRoutes } from './routes/personas/index.js'
import { providerRoutes } from './routes/providers/index.js'
import { settingRoutes } from './routes/settings/index.js'

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  await registerSwagger(app)
  registerErrorHandler(app)

  await app.register(healthRoutes)
  await app.register(conversationRoutes, { prefix: '/api/v1/conversations' })
  await app.register(messageRoutes, { prefix: '/api/v1/messages' })
  await app.register(modelRoutes, { prefix: '/api/v1/models' })
  await app.register(providerRoutes, { prefix: '/api/v1/providers' })
  await app.register(personaRoutes, { prefix: '/api/v1/personas' })
  await app.register(settingRoutes, { prefix: '/api/v1/settings' })

  return app
}

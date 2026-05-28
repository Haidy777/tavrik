import fastifySwagger from '@fastify/swagger'
import scalarReference from '@scalar/fastify-api-reference'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import type { AppInstance } from '../types.js'

export async function registerSwagger(app: AppInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Tavrik API',
        version: '0.1.0',
        description: 'Tavrik chat bot API',
      },
    },
    transform: jsonSchemaTransform,
  })

  await app.register(scalarReference, {
    routePrefix: '/docs',
  })
}

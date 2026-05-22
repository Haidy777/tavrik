import type { AppInstance } from '../../types.js'
import { providerModelRoutes } from './[providerId]/models/index.js'

export async function providerRoutes(app: AppInstance) {
  // TODO: CRUD endpoints for providers

  await app.register(providerModelRoutes, {
    prefix: '/:providerId/models',
  })
}

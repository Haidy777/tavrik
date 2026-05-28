import { migrateToLatest } from '@tavrik/core'
import { loadAndStoreAvailableModel } from '@tavrik/core/provider'
import { initResponseSchema } from '@tavrik/sdk/schemas'
import type { AppInstance } from '../types.js'

let initialized = false

export async function indexRoutes(app: AppInstance) {
  app.post(
    '/init',
    {
      schema: {
        response: { 200: initResponseSchema },
        tags: ['System'],
      },
    },
    async () => {
      if (!initialized) {
        await migrateToLatest()
        await loadAndStoreAvailableModel()
        initialized = true
      }

      return { initialized }
    }
  )
}

import { db } from '@tavrik/core/database'
import { z } from 'zod'
import type { AppInstance } from '../types.js'

const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  timestamp: z.string(),
  database: z.boolean(),
})

export async function healthRoutes(app: AppInstance) {
  app.get(
    '/health',
    {
      schema: {
        response: { 200: healthResponseSchema },
        tags: ['System'],
      },
    },
    async () => {
      let dbOk = false
      try {
        await db.selectFrom('system.settings').select('id').limit(1).execute()
        dbOk = true
      } catch {
        // database unreachable
      }

      return {
        status: dbOk ? ('ok' as const) : ('degraded' as const),
        timestamp: new Date().toISOString(),
        database: dbOk,
      }
    }
  )
}

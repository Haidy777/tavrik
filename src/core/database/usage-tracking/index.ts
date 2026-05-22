import { moduleLogger } from '../../logger.js'
import { db } from '../db.js'
import type { ChatsMessageSource } from '../generated.js'

const logger = moduleLogger('usageTracking')

export async function trackUsage(
  modelId: string,
  functionName: string,
  inTokens: number,
  outTokens: number,
  source: ChatsMessageSource
) {
  logger.debug(
    `Tracking usage for model ${modelId}, function ${functionName}, inTokens ${inTokens}, outTokens ${outTokens}`
  )

  await db
    .insertInto('system.usageTracking')
    .values({
      modelId,
      functionName,
      inTokens,
      outTokens,
      source,
    })
    .execute()
}

import { db } from '../database/index.js'
import type { LLMMessage } from './base/index.js'
import { getProvider } from './registry.js'

export async function sendMessage(
  modelId: string,
  systemPrompt: string,
  messages: LLMMessage[]
) {
  const modelInfo = await db
    .selectFrom('provider.models')
    .selectAll()
    .select('id')
    .where('id', '=', modelId)
    .executeTakeFirstOrThrow()

  if (!modelInfo.capabilities.includes('text')) {
    throw new Error('Model does not support text')
  }

  const providers = await getProvider(modelInfo)

  return providers.sendMessage(modelInfo.name, systemPrompt, messages)
}

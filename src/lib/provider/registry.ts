import type { Selectable } from 'kysely'
import type {
  ProviderModels,
  ProviderProviderType,
} from '../database/generated.js'
import { db } from '../database/index.js'
import type { BaseLLMProvider } from './base/index.js'
import { OpenAiProvider } from './openai/index.js'

const hotProviderRegistry = new Map<ProviderProviderType, BaseLLMProvider>()

export async function getProvider(
  model: Selectable<ProviderModels>
): Promise<BaseLLMProvider> {
  const providerInfo = await db
    .selectFrom('provider.providers')
    .selectAll()
    .where('id', '=', model.providerId)
    .executeTakeFirstOrThrow()

  if (hotProviderRegistry.has(providerInfo.type)) {
    return hotProviderRegistry.get(providerInfo.type) as BaseLLMProvider
  }

  if (providerInfo.type === 'openai') {
    const provider = new OpenAiProvider()

    hotProviderRegistry.set(providerInfo.type, provider)

    return provider
  }

  throw new Error(`Unsupported provider type: ${providerInfo.type}`)
}

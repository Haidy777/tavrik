import type { Selectable } from 'kysely'
import type {
  ProviderModels,
  ProviderProviderType,
} from '../database/generated.js'
import { db } from '../database/index.js'
import { AnthropicProvider } from './anthropic/index.js'
import type { BaseLLMProvider } from './base/index.js'
import { GoogleProvider } from './google/index.js'
import { MistralProvider } from './mistral/index.js'
import { OpenAiProvider } from './openai/index.js'
import { OpenAICompatibleProvider } from './openai-compatible/index.js'
import { OpenRouterProvider } from './openrouter/index.js'

const hotProviderRegistry = new Map<ProviderProviderType, BaseLLMProvider>()
const hotOpenAiCompatibleProviderRegistry = new Map<
  string,
  OpenAICompatibleProvider
>()

export function getProviderByType<P extends BaseLLMProvider = BaseLLMProvider>(
  type: ProviderProviderType
): P | null {
  if (hotProviderRegistry.has(type)) {
    return hotProviderRegistry.get(type) as unknown as P
  }

  if (type === 'openai') {
    const provider = new OpenAiProvider()

    hotProviderRegistry.set(type, provider)

    return provider as unknown as P
  } else if (type === 'anthropic') {
    const provider = new AnthropicProvider()

    hotProviderRegistry.set(type, provider)

    return provider as unknown as P
  } else if (type === 'google') {
    const provider = new GoogleProvider()

    hotProviderRegistry.set(type, provider)

    return provider as unknown as P
  } else if (type === 'openrouter') {
    const provider = new OpenRouterProvider()

    hotProviderRegistry.set(type, provider)

    return provider as unknown as P
  } else if (type === 'mistral') {
    const provider = new MistralProvider()

    hotProviderRegistry.set(type, provider)

    return provider as unknown as P
  }

  return null
}

export async function getProvider<P extends BaseLLMProvider = BaseLLMProvider>(
  model: Selectable<ProviderModels>
): Promise<P> {
  const providerInfo = await db
    .selectFrom('provider.providers')
    .selectAll()
    .where('id', '=', model.providerId)
    .executeTakeFirstOrThrow()

  const simpleProvider = getProviderByType(providerInfo.type)

  if (simpleProvider) {
    return simpleProvider as unknown as P
  }

  if (providerInfo.type === 'openai-compatible') {
    if (hotOpenAiCompatibleProviderRegistry.has(providerInfo.name)) {
      return hotOpenAiCompatibleProviderRegistry.get(
        providerInfo.name
      ) as unknown as P
    }

    if (!providerInfo.endpoint) {
      throw new Error('OpenAI compatible provider must have an endpoint')
    }

    const apiKey =
      process.env[
        `OPEN_AI_COMPATIBLE_${providerInfo.name.toUpperCase()}_API_KEY`
      ]

    const provider = new OpenAICompatibleProvider(apiKey, providerInfo.endpoint)

    hotOpenAiCompatibleProviderRegistry.set(providerInfo.name, provider)

    return provider as unknown as P
  }

  throw new Error(`Unsupported provider type: ${providerInfo.type}`)
}

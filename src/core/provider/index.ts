import { db } from '../database/index.js'
import { ENV_CONFIG } from '../env.js'
import type { LLMMessage } from './base/index.js'
import { getProvider, getProviderByType } from './registry.js'

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

let loaded = false

export async function loadAndStoreAvailableModel() {
  if (loaded) {
    return
  }

  if (ENV_CONFIG.OPENAI_API_KEY) {
    const models = await getProviderByType('openai')?.listModels()
    const openAiProviderInfo = await db
      .selectFrom('provider.providers')
      .where('type', '=', 'openai')
      .select('id')
      .executeTakeFirst()

    if (openAiProviderInfo && models) {
      await db
        .insertInto('provider.models')
        .values(
          models.map((model) => ({
            providerId: openAiProviderInfo.id,
            name: model.id,
            capabilities: model.capabilities,
            inTokensPrice: 0, // TODO
            outTokensPrice: 0, // TODO
          }))
        )
        .onConflict((oc) =>
          oc.columns(['providerId', 'name']).doUpdateSet({
            capabilities: (eb) => eb.ref('excluded.capabilities'),
            updatedAt: new Date(),
          })
        )
        .execute()
    }
  }

  if (ENV_CONFIG.ANTHROPIC_API_KEY) {
    const models = await getProviderByType('anthropic')?.listModels()
    const anthropicProviderInfo = await db
      .selectFrom('provider.providers')
      .where('type', '=', 'anthropic')
      .select('id')
      .executeTakeFirst()

    if (models && anthropicProviderInfo) {
      await db
        .insertInto('provider.models')
        .values(
          models.map((model) => ({
            providerId: anthropicProviderInfo.id,
            name: model.id,
            capabilities: model.capabilities,
            inTokensPrice: 0, // todo
            outTokensPrice: 0, // todo
          }))
        )
        .onConflict((oc) =>
          oc.columns(['providerId', 'name']).doUpdateSet({
            capabilities: (eb) => eb.ref('excluded.capabilities'),
            updatedAt: new Date(),
          })
        )
        .execute()
    }
  }

  if (ENV_CONFIG.GOOGLE_API_KEY) {
    const models = await getProviderByType('google')?.listModels()
    const googleProviderInfo = await db
      .selectFrom('provider.providers')
      .where('type', '=', 'google')
      .select('id')
      .executeTakeFirst()

    if (models && googleProviderInfo) {
      await db
        .insertInto('provider.models')
        .values(
          models.map((model) => ({
            providerId: googleProviderInfo.id,
            name: model.id,
            capabilities: model.capabilities,
            inTokensPrice: 0, // todo
            outTokensPrice: 0, // todo
          }))
        )
        .onConflict((oc) =>
          oc.columns(['providerId', 'name']).doUpdateSet({
            capabilities: (eb) => eb.ref('excluded.capabilities'),
            updatedAt: new Date(),
          })
        )
        .execute()
    }
  }

  if (ENV_CONFIG.OPENROUTER_API_KEY) {
    const models = await getProviderByType('openrouter')?.listModels()
    const openRouterProviderInfo = await db
      .selectFrom('provider.providers')
      .where('type', '=', 'openrouter')
      .select('id')
      .executeTakeFirst()

    if (models && openRouterProviderInfo) {
      await db
        .insertInto('provider.models')
        .values(
          models.map((model) => ({
            providerId: openRouterProviderInfo.id,
            name: model.id,
            capabilities: model.capabilities,
            inTokensPrice: 0, // todo
            outTokensPrice: 0, // todo
          }))
        )
        .onConflict((oc) =>
          oc.columns(['providerId', 'name']).doUpdateSet({
            capabilities: (eb) => eb.ref('excluded.capabilities'),
            updatedAt: new Date(),
          })
        )
        .execute()
    }
  }

  if (ENV_CONFIG.MISTRAL_API_KEY) {
    const models = await getProviderByType('mistral')?.listModels()
    const mistralProviderInfo = await db
      .selectFrom('provider.providers')
      .where('type', '=', 'mistral')
      .select('id')
      .executeTakeFirst()

    if (models && mistralProviderInfo) {
      await db
        .insertInto('provider.models')
        .values(
          models.map((model) => ({
            providerId: mistralProviderInfo.id,
            name: model.id,
            capabilities: model.capabilities,
            inTokensPrice: 0, // todo
            outTokensPrice: 0, // todo
          }))
        )
        .onConflict((oc) =>
          oc.columns(['providerId', 'name']).doUpdateSet({
            capabilities: (eb) => eb.ref('excluded.capabilities'),
            updatedAt: new Date(),
          })
        )
        .execute()
    }
  }

  loaded = true
}

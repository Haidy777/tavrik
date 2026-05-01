import type { ProviderModelCapabilities } from '../../database/generated.js'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import type { ModelInfo } from '../base/index.js'
import { OpenAICompatibleProvider } from '../openai-compatible/index.js'

const logger = moduleLogger('OpenAiProvider')

export class OpenAiProvider extends OpenAICompatibleProvider {
  constructor() {
    if (!ENV_CONFIG.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables')
    }

    super(ENV_CONFIG.OPENAI_API_KEY)
  }

  async listModels(): Promise<ModelInfo[]> {
    const models: ModelInfo[] = []

    for await (const model of this._client.models.list()) {
      const parsedCapabilities: ProviderModelCapabilities[] = ['text'] // todo probably not true for all?

      if (model.id.includes('text-embedding')) {
        parsedCapabilities.push('embedding')
      }

      if (model.id.includes('whisper') || model.id.includes('transcribe')) {
        parsedCapabilities.push('stt')
      }

      if (model.id.includes('tts')) {
        parsedCapabilities.push('tts')
      }

      // todo detect other models

      logger.debug({ model }, `Found model: ${model.id}`)

      models.push({
        id: model.id,
        name: model.id,
        maxInputTokens: 0,
        maxTokens: 0,
        capabilities: parsedCapabilities,
      })
    }

    return models
  }
}

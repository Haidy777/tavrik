import { Mistral } from '@mistralai/mistralai'
import type { AssistantMessage } from '@mistralai/mistralai/models/components/assistantmessage'
import type { SystemMessage } from '@mistralai/mistralai/models/components/systemmessage'
import type { ToolMessage } from '@mistralai/mistralai/models/components/toolmessage'
import type { UserMessage } from '@mistralai/mistralai/models/components/usermessage'
import type { ProviderModelCapabilities } from '../../database/generated.js'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
  type ModelInfo,
  type SendMessageResult,
} from '../base/index.js'

const logger = moduleLogger('MistralProvider')

export class MistralProvider extends BaseLLMProvider {
  private readonly _client: Mistral

  constructor() {
    super()

    if (!ENV_CONFIG.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY is not set in environment variables')
    }

    this._client = new Mistral({
      apiKey: ENV_CONFIG.MISTRAL_API_KEY,
    })
  }

  async sendMessage(
    model: string,
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<SendMessageResult> {
    const conversationMessages: Array<
      | (AssistantMessage & { role: 'assistant' })
      | SystemMessage
      | ToolMessage
      | UserMessage
    > = []

    if (systemPrompt !== '') {
      logger.debug(
        {
          func: 'sendMessage',
        },
        `Adding system prompt to conversation`
      )
      conversationMessages.push({ role: 'system', content: systemPrompt })
    }

    logger.debug(
      {
        func: 'sendMessage',
      },
      `Adding ${messages.length} messages to conversation`
    )

    const result = await this._client.chat.complete({
      model,
      messages,
      responseFormat: { type: 'text' },
      maxTokens: 4096, // todo make configurable later
    })

    for (const message of messages) {
      conversationMessages.push({
        role: message.role,
        content: message.content,
      })
    }

    return {
      textResponse: (result.choices[0].message?.content as string) ?? '',
      outputTokens: result.usage.completionTokens || 0,
      inputTokens: result.usage.promptTokens || 0,
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    const models: ModelInfo[] = []
    const mistralModels = (await this._client.models.list()).data ?? []
    const seen = new Set<string>() // mistral has duplicate ids, so we need to deduplicate

    for (const model of mistralModels) {
      if (model.type !== 'base' && model.type !== 'fine-tuned') {
        // todo might be used later?
        continue
      }

      const parsedCapabilities: ProviderModelCapabilities[] = []

      if (seen.has(model.id)) {
        continue
      }

      seen.add(model.id)

      if (model.capabilities.completionChat) {
        parsedCapabilities.push('text')
      }

      if (model.capabilities.functionCalling) {
        parsedCapabilities.push('tools')
      }

      if (model.capabilities.reasoning) {
        parsedCapabilities.push('thinking')
      }

      if (model.capabilities.completionFim) {
        // todo not used yet
      }

      if (model.capabilities.fineTuning) {
        // todo not used yet
      }

      if (model.capabilities.vision) {
        parsedCapabilities.push('vision')
      }

      if (model.capabilities.ocr) {
        // todo not used yet
      }

      if (model.capabilities.classification) {
        // todo not used yet
      }

      if (model.capabilities.moderation) {
        // todo not used yet
      }

      if (model.capabilities.audio) {
        // todo not used yet (? maybe audio input?)
      }

      if (model.capabilities.audioTranscription) {
        parsedCapabilities.push('stt')
      }

      if (model.capabilities.audioTranscriptionRealtime) {
        // todo not used yet
        // realtime stt (i guess voice calls?)
      }

      if (model.capabilities.audioSpeech) {
        parsedCapabilities.push('tts')
      }

      logger.debug(
        { capabilities: model.capabilities },
        `Found model: ${model.id} ${model.name}`
      )

      models.push({
        id: model.id,
        name: model.name || model.id,
        capabilities: parsedCapabilities,
        maxTokens: model.maxContextLength,
        maxInputTokens: model.maxContextLength, // todo?
      })
    }

    return models
  }
}

import { OpenRouter } from '@openrouter/sdk'
import type { ChatMessages } from '@openrouter/sdk/models/chatmessages'
import type { ProviderModelCapabilities } from '../../database/generated.js'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
  type ModelInfo,
  type SendMessageResult,
} from '../base/index.js'

const logger = moduleLogger('OpenRouterProvider')

export class OpenRouterProvider extends BaseLLMProvider {
  private readonly _client: OpenRouter

  constructor() {
    super()

    if (!ENV_CONFIG.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables')
    }

    this._client = new OpenRouter({
      apiKey: ENV_CONFIG.OPENROUTER_API_KEY,
    })
  }

  async sendMessage(
    model: string,
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<SendMessageResult> {
    // todo needs a custom system prompt handler for providers & models?

    const conversationMessages: ChatMessages[] = []

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

    for (const message of messages) {
      conversationMessages.push({
        role: message.role,
        content: message.content,
      })
    }

    const result = await this._client.chat.send({
      chatRequest: {
        model,
        messages: conversationMessages,
        maxTokens: 4096, // todo make configurable later
      },
    })

    return {
      inputTokens: result.usage?.promptTokens || 0,
      outputTokens: result.usage?.completionTokens || 0,
      textResponse: result.choices[0].message.content ?? '',
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    const models: ModelInfo[] = []
    const openRouterModels = (await this._client.models.list()).data ?? []

    for (const model of openRouterModels) {
      const parsedCapabilities: ProviderModelCapabilities[] = ['text']

      if (
        model.supportedParameters.includes('tools') ||
        model.supportedParameters.includes('tool_choice') ||
        model.supportedParameters.includes('parallel_tool_calls')
      ) {
        parsedCapabilities.push('tools')
      }

      if (
        model.supportedParameters.includes('include_reasoning') ||
        model.supportedParameters.includes('reasoning') ||
        model.supportedParameters.includes('include_reasoning')
      ) {
        parsedCapabilities.push('thinking')
      }

      logger.debug(
        { capabilities: model.supportedParameters },
        `Found model ${model.id} ${model.name} ${model.supportedParameters.join(', ')}`
      )

      models.push({
        id: model.id,
        name: model.name,
        maxTokens: model.contextLength || 0,
        maxInputTokens: model.contextLength || 0,
        capabilities: parsedCapabilities,
      })
    }

    return models
  }
}

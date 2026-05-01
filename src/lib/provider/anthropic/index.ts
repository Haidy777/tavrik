import { Anthropic } from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs'
import type { ProviderModelCapabilities } from '../../database/generated.js'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
  type ModelInfo,
  type SendMessageResult,
} from '../base/index.js'

const logger = moduleLogger('AnthropicProvider')

export class AnthropicProvider extends BaseLLMProvider {
  private readonly _client: Anthropic

  constructor() {
    super()

    if (!ENV_CONFIG.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables')
    }

    this._client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async sendMessage(
    model: string,
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<SendMessageResult> {
    const conversationMessages: MessageParam[] = []

    if (systemPrompt !== '') {
      logger.debug(
        {
          func: 'sendMessage',
        },
        `Adding system prompt to conversation`
      )
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

    const result = await this._client.messages.create({
      model,
      system: systemPrompt !== '' ? systemPrompt : undefined,
      max_tokens: 4096, //  todo make configurable later
      messages: conversationMessages,
    })

    let textResponse = ''
    let thinkingResponse = ''

    for (const resultBlock of result.content) {
      if (resultBlock.type === 'text') {
        textResponse += `${resultBlock.text}\n`
      } else if (resultBlock.type === 'thinking') {
        thinkingResponse += `${resultBlock.thinking}\n`
      } else {
        // todo maybe expand later
        logger.debug(
          {
            func: 'sendMessage',
          },
          `Unknown Response Block ${resultBlock.type}`
        )
      }
    }

    return {
      inputTokens: result.usage.input_tokens,
      outputTokens: result.usage.output_tokens,
      textResponse: textResponse,
      thinkingResponse,
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    const models: ModelInfo[] = []

    for await (const model of this._client.models.list()) {
      const parsedCapabilities: ProviderModelCapabilities[] = ['text'] // text input supported by all

      if (model.capabilities?.citations.supported) {
        // todo not used yet
        parsedCapabilities.push('citation')
      }

      if (model.capabilities?.batch.supported) {
        // todo not used yet
      }

      if (model.capabilities?.code_execution.supported) {
        // todo code exectution tools, not used yet
      }

      if (model.capabilities?.context_management.supported) {
        // todo not used yet
      }

      if (model.capabilities?.effort.supported) {
        // todo not used yet
      }

      if (model.capabilities?.image_input.supported) {
        parsedCapabilities.push('vision')
      }

      if (model.capabilities?.pdf_input.supported) {
        // todo not used yet
      }

      if (model.capabilities?.structured_outputs.supported) {
        // todo not used yet
      }

      if (model.capabilities?.thinking.supported) {
        parsedCapabilities.push('thinking')
      }

      logger.debug(
        { capabilities: model.capabilities },
        `Found model: ${model.id} ${model.display_name}`
      )

      models.push({
        id: model.id,
        name: model.display_name,
        capabilities: parsedCapabilities,
        maxInputTokens: model.max_input_tokens ?? 0,
        maxTokens: model.max_tokens ?? 0,
      })
    }

    return models
  }
}

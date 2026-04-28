import { Anthropic } from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
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
}

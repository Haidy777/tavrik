import { OpenRouter } from '@openrouter/sdk'
import type { ChatMessages } from '@openrouter/sdk/models/chatmessages'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
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
}

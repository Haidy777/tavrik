import { OpenAI } from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions/completions'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
  type SendMessageResult,
} from '../base/index.js'

const logger = moduleLogger('OpenAICompatibleProvider')

export class OpenAICompatibleProvider extends BaseLLMProvider {
  private readonly _client: OpenAI

  constructor(apiKey?: string, endpoint?: string) {
    super()

    this._client = new OpenAI({
      baseURL: endpoint,
      apiKey: apiKey,
    })
  }

  async sendMessage(
    model: string,
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<SendMessageResult> {
    const conversationMessages: ChatCompletionMessageParam[] = []

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

    const result = await this._client.chat.completions.create({
      model,
      max_completion_tokens: 4096, // todo make configurable later
      messages: conversationMessages,
    })

    return {
      inputTokens: result.usage?.prompt_tokens || 0,
      outputTokens: result.usage?.completion_tokens || 0,
      textResponse: result.choices?.[0].message.content ?? '',
    }
  }
}

import { Mistral } from '@mistralai/mistralai'
import type { AssistantMessage } from '@mistralai/mistralai/models/components/assistantmessage'
import type { SystemMessage } from '@mistralai/mistralai/models/components/systemmessage'
import type { ToolMessage } from '@mistralai/mistralai/models/components/toolmessage'
import type { UserMessage } from '@mistralai/mistralai/models/components/usermessage'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
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
}

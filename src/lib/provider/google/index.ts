import { type Content, GoogleGenAI } from '@google/genai'
import { ENV_CONFIG } from '../../env.js'
import { moduleLogger } from '../../logger.js'
import {
  BaseLLMProvider,
  type LLMMessage,
  type SendMessageResult,
} from '../base/index.js'

const logger = moduleLogger('GoogleProvider')

export class GoogleProvider extends BaseLLMProvider {
  private readonly _client: GoogleGenAI

  constructor() {
    super()

    if (!ENV_CONFIG.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not set in environment variables')
    }

    this._client = new GoogleGenAI({
      apiKey: ENV_CONFIG.GOOGLE_API_KEY,
    })
  }

  async sendMessage(
    model: string,
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<SendMessageResult> {
    const conversationMessages: Content[] = []

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
        role: message.role === 'user' ? 'user' : 'model',
        parts: [
          {
            text: message.content,
          },
        ],
      })
    }

    const result = await this._client.models.generateContent({
      model,
      contents: conversationMessages,
      config: {
        systemInstruction: systemPrompt !== '' ? systemPrompt : undefined,
      },
    })

    return {
      textResponse: result.text || '',
      inputTokens: result.usageMetadata?.promptTokenCount || 0,
      outputTokens: result.usageMetadata?.candidatesTokenCount || 0,
    }
  }
}

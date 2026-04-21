import type { Role } from '../../database/generated.js'

export interface SendMessageResult {
  inputTokens: number
  outputTokens: number
  content: string
}

export interface LLMMessage {
  role: Role
  content: string
}

export abstract class BaseLLMProvider {
  abstract sendMessage(
    model: string,
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<SendMessageResult> // todo add tools
}

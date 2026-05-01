import type {
  ProviderModelCapabilities,
  Role,
} from '../../database/generated.js'

export interface SendMessageResult {
  inputTokens: number
  outputTokens: number
  textResponse: string
  thinkingResponse?: string
}

export interface LLMMessage {
  role: Role
  content: string
}

export interface ModelInfo {
  id: string
  name: string
  capabilities: ProviderModelCapabilities[]
  maxInputTokens: number
  maxTokens: number
}

export abstract class BaseLLMProvider {
  abstract sendMessage(
    model: string,
    systemPrompt: string,
    messages: LLMMessage[]
  ): Promise<SendMessageResult> // todo add tools

  abstract listModels(): Promise<ModelInfo[]>
  // todo stream message

  // todo list models
}

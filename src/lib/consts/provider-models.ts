export interface IModelInfo {
  name: string
  capabilities: string[]
  in_tokens_price: number | null
  out_tokens_price: number | null
}

// from https://openrouter.ai/openai/
export const OPEN_AI_MODELS: IModelInfo[] = [
  {
    name: 'gpt-4o-2024-11-20',
    capabilities: ['text', 'tools'],
    in_tokens_price: 2.5,
    out_tokens_price: 10,
  },
  {
    name: 'gpt-4o-mini-tts-2025-12-15',
    capabilities: ['tts'],
    in_tokens_price: 0.6,
    out_tokens_price: null,
  },
  {
    name: 'openai/text-embedding-3-large',
    capabilities: ['embedding'],
    in_tokens_price: 0.13,
    out_tokens_price: null,
  },
  {
    name: 'text-embedding-3-small',
    capabilities: ['embedding'],
    in_tokens_price: 0.02,
    out_tokens_price: null,
  },
]

// from https://openrouter.ai/anthropic/
export const ANTHROPIC_MODELS: IModelInfo[] = [
  {
    name: 'claude-sonnet-4.6',
    capabilities: ['text', 'tools'],
    in_tokens_price: 3,
    out_tokens_price: 15,
  },
  {
    name: 'claude-opus-4.6',
    capabilities: ['text', 'tools'],
    in_tokens_price: 5,
    out_tokens_price: 25,
  },
  {
    name: 'claude-haiku-4.5',
    capabilities: ['text', 'tools'],
    in_tokens_price: 1,
    out_tokens_price: 5,
  },
]

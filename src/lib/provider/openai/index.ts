import { ENV_CONFIG } from '../../env.js'
import { OpenAICompatibleProvider } from '../openai-compatible/index.js'

export class OpenAiProvider extends OpenAICompatibleProvider {
  constructor() {
    if (!ENV_CONFIG.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables')
    }

    super(ENV_CONFIG.OPENAI_API_KEY)
  }
}

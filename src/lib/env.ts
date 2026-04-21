import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
dotenv.config({ path: path.join(root, '.env') })

export const ENV_CONFIG = {
  ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,

  DEBUG_LOG_FULL_PROMPTS: process.env.DEBUG_LOG_FULL_PROMPTS === 'true',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
}

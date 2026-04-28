import pino from 'pino'
import { ENV_CONFIG } from './env.js'

export const logger = pino({
  level: 'debug',
  transport:
    ENV_CONFIG.ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
})

export const moduleLogger = (mod: string) => {
  return logger.child({ mod })
}

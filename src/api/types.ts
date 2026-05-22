import type { FastifyInstance as BaseFastifyInstance } from 'fastify'
import type { Logger } from 'pino'

export type AppInstance = BaseFastifyInstance<
  import('node:http').Server,
  import('node:http').IncomingMessage,
  import('node:http').ServerResponse,
  Logger
>

import { ENV_CONFIG } from '@tavrik/core/env'
import type { FastifyError } from 'fastify'
import type { AppInstance } from '../types.js'

export function registerErrorHandler(app: AppInstance) {
  const isProduction = ENV_CONFIG.ENV === 'production'

  app.setErrorHandler((error: FastifyError, request, reply) => {
    request.log.error(error)

    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        statusCode: 400,
      })
    }

    const statusCode = error.statusCode || 500
    const message =
      statusCode >= 500 && isProduction
        ? 'Internal Server Error'
        : error.message

    return reply.status(statusCode).send({
      error: 'Internal Server Error',
      message,
      statusCode,
    })
  })
}

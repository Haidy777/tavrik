import type { AppInstance } from '../types.js'

export function registerRequestLogger(app: AppInstance) {
  app.addHook('preHandler', async (request) => {
    request.log = request.log.child({
      route: request.routeOptions.url,
      method: request.method,
      params: request.params,
      query: request.query,
      body: request.body,
    })
  })
}

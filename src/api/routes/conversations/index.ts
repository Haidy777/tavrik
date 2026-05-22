import type { AppInstance } from '../../types.js'
import { conversationMessageRoutes } from './[conversationId]/messages/index.js'

export async function conversationRoutes(app: AppInstance) {
  // TODO: CRUD endpoints for conversations

  await app.register(conversationMessageRoutes, {
    prefix: '/:conversationId/messages',
  })
}

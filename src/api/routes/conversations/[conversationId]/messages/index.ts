import { db } from '@tavrik/core'
import { sendMessage } from '@tavrik/core/provider'
import { autoSummarize } from '@tavrik/core/summarize'
import {
  type ConversationMessageBody,
  type ConversationParams,
  conversationMessageBodySchema,
  conversationMessageResponseSchema,
  conversationParamsSchema,
} from '@tavrik/sdk/schemas'
import type { AppInstance } from '../../../../types.js'

export async function conversationMessageRoutes(app: AppInstance) {
  // TODO: CRUD endpoints for messages

  app.post(
    '/',
    {
      schema: {
        params: conversationParamsSchema,
        body: conversationMessageBodySchema,
        response: {
          200: conversationMessageResponseSchema,
        },
        tags: ['Conversations > Messages'],
      },
    },
    async (request, _reply) => {
      const { conversationId } = request.params as ConversationParams
      const body = request.body as ConversationMessageBody

      const conversation = await db
        .selectFrom('chats.conversations')
        .selectAll()
        .where('id', '=', conversationId)
        .executeTakeFirstOrThrow()

      let systemPrompt = ''
      let persona = null

      if (conversation.personaId) {
        persona = await db
          .selectFrom('personas.personas')
          .selectAll()
          .where('id', '=', conversation.personaId)
          .executeTakeFirstOrThrow()

        systemPrompt += persona.systemPrompt
      }

      if (conversation.personaModifierId) {
        const personaModifier = await db
          .selectFrom('personas.modifiers')
          .select(['name', 'systemPromptModifier'])
          .where('id', '=', conversation.personaModifierId)
          .executeTakeFirstOrThrow()

        systemPrompt += `\n\n${personaModifier.systemPromptModifier}`
      }

      let userProfile = null

      if (conversation.userProfileId) {
        userProfile = await db
          .selectFrom('personas.userProfiles')
          .selectAll()
          .where('id', '=', conversation.userProfileId)
          .executeTakeFirstOrThrow()

        systemPrompt += `\n\n${userProfile.profile}`
      }

      // fetch history before inserting the new user message
      // so autoSummarize doesn't count/include it in the summary
      const messageHistory = await db
        .selectFrom('chats.messages')
        .selectAll()
        .where('conversationId', '=', conversation.id)
        .orderBy('id', 'asc')
        .execute()

      const summaryResult = await autoSummarize(
        conversation,
        messageHistory,
        persona?.language || userProfile?.language || 'en',
        body.source || 'web'
      )

      if (summaryResult) {
        systemPrompt += `\n\n${summaryResult.summaryText}`
      }

      await db
        .insertInto('chats.messages')
        .values({
          conversationId,
          content: body.message,
          source: body.source,
          role: 'user',
        })
        .execute()

      const messagesToSend = [
        ...(summaryResult ? summaryResult.messagesToSend : messageHistory),
        { role: 'user' as const, content: body.message },
      ]

      const response = await sendMessage(
        conversation.chatModelId,
        systemPrompt,
        messagesToSend
      )

      await db
        .insertInto('chats.messages')
        .values({
          conversationId,
          content: response.textResponse,
          role: 'assistant',
          source: body.source,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
        })
        .execute()

      return { modelResponse: response.textResponse }
    }
  )
}

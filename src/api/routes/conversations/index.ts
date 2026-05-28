import type { ChatsConversations, DB } from '@tavrik/core/database'
import { db, getSetting } from '@tavrik/core/database'
import type {
  ConversationListQuerystring,
  ConversationParams,
  CreateConversationBody,
  UpdateConversationBody,
} from '@tavrik/sdk/schemas'
import {
  conversationListQuerystringSchema,
  conversationListResponseSchema,
  conversationParamsSchema,
  conversationResponseSchema,
  createConversationBodySchema,
  errorResponseSchema,
  updateConversationBodySchema,
} from '@tavrik/sdk/schemas'
import type { Selectable, UpdateObject } from 'kysely'
import { z } from 'zod'
import type { AppInstance } from '../../types.js'
import { conversationMessageRoutes } from './[conversationId]/messages/index.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// rollingSummary and rollingSummaryCreatedAt intentionally omitted from
// the response — summary text can be large, use the messages endpoint instead
function formatConversation(row: Selectable<ChatsConversations>) {
  return {
    id: String(row.id),
    title: row.title,
    archived: row.archived,
    ephemeral: row.ephemeral,
    chatModelId: String(row.chatModelId),
    personaId: row.personaId ? String(row.personaId) : null,
    personaModifierId: row.personaModifierId
      ? String(row.personaModifierId)
      : null,
    userProfileId: row.userProfileId ? String(row.userProfileId) : null,
    rollingSummaryEnabled: row.rollingSummaryEnabled,
    rollingSummaryModelId: row.rollingSummaryModelId
      ? String(row.rollingSummaryModelId)
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export async function conversationRoutes(app: AppInstance) {
  // LIST — GET /api/v1/conversations
  app.get(
    '/',
    {
      schema: {
        querystring: conversationListQuerystringSchema,
        response: { 200: conversationListResponseSchema },
        tags: ['Conversations'],
      },
    },
    async (request) => {
      const { archived, limit, offset } =
        request.query as ConversationListQuerystring

      let baseQuery = db.selectFrom('chats.conversations')

      if (archived !== undefined) {
        baseQuery = baseQuery.where('archived', '=', archived === 'true')
      }

      const [rows, countResult] = await Promise.all([
        baseQuery
          .selectAll()
          .orderBy('updatedAt', 'desc')
          .limit(limit)
          .offset(offset)
          .execute(),
        baseQuery
          .select(db.fn.countAll().as('total'))
          .executeTakeFirstOrThrow(),
      ])

      return {
        data: rows.map(formatConversation),
        total: Number(countResult.total),
      }
    }
  )

  app.get(
    '/latest',
    {
      schema: {
        response: {
          200: conversationResponseSchema,
          404: errorResponseSchema,
        },
        tags: ['Conversations'],
      },
    },
    async (_request, reply) => {
      const latestConversation = await db
        .selectFrom('chats.conversations')
        .selectAll()
        .orderBy('createdAt', 'desc')
        .limit(1)
        .executeTakeFirst()

      if (!latestConversation) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'No conversations found',
        })
      }

      return reply.status(200).send(formatConversation(latestConversation))
    }
  )

  // GET ONE — GET /api/v1/conversations/:conversationId
  app.get(
    '/:conversationId',
    {
      schema: {
        params: conversationParamsSchema,
        response: {
          200: conversationResponseSchema,
          404: errorResponseSchema,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const { conversationId } = request.params as ConversationParams

      const row = await db
        .selectFrom('chats.conversations')
        .selectAll()
        .where('id', '=', conversationId)
        .executeTakeFirst()

      if (!row) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Conversation ${conversationId} not found`,
          statusCode: 404,
        })
      }

      return formatConversation(row)
    }
  )

  // CREATE — POST /api/v1/conversations
  app.post(
    '/',
    {
      schema: {
        body: createConversationBodySchema,
        response: {
          201: conversationResponseSchema,
          400: errorResponseSchema,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const body = request.body as CreateConversationBody

      const usedChatModelId =
        body.chatModelId ??
        String((await getSetting('default_chat_model_id'))?.id ?? '')

      if (!usedChatModelId) {
        return reply.status(400).send({
          error: 'Bad Request',
          message:
            'No chatModelId provided and no default chat model configured',
          statusCode: 400,
        })
      }

      const usedRollingSummaryModelId =
        (body.rollingSummaryModelId ??
          String(
            (await getSetting('default_rolling_summary_model_id'))?.id ?? ''
          )) ||
        null

      const usedPersonaId =
        (body.personaId ??
          String((await getSetting('default_persona_id'))?.id ?? '')) ||
        null

      const usedPersonaModifierId =
        (body.personaModifierId ??
          String(
            (await getSetting('default_persona_modifier_id'))?.id ?? ''
          )) ||
        null

      const usedUserProfileId =
        (body.userProfileId ??
          String((await getSetting('default_user_profile_id'))?.id ?? '')) ||
        null

      const row = await db
        .insertInto('chats.conversations')
        .values({
          title: body.title ?? new Date().toISOString(),
          chatModelId: usedChatModelId,
          personaId: usedPersonaId,
          personaModifierId: usedPersonaModifierId,
          userProfileId: usedUserProfileId,
          rollingSummaryEnabled: body.rollingSummaryEnabled ?? true,
          rollingSummaryModelId: usedRollingSummaryModelId,
          ephemeral: body.ephemeral ?? false,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return reply.status(201).send(formatConversation(row))
    }
  )

  // UPDATE — PATCH /api/v1/conversations/:conversationId
  app.patch(
    '/:conversationId',
    {
      schema: {
        params: conversationParamsSchema,
        body: updateConversationBodySchema,
        response: {
          200: conversationResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const { conversationId } = request.params as ConversationParams
      const body = request.body as UpdateConversationBody

      const update: UpdateObject<DB, 'chats.conversations'> = {}
      if (body.title !== undefined) update.title = body.title
      if (body.archived !== undefined) update.archived = body.archived
      if (body.chatModelId !== undefined) update.chatModelId = body.chatModelId
      if (body.personaId !== undefined)
        update.personaId = body.personaId ?? null
      if (body.personaModifierId !== undefined)
        update.personaModifierId = body.personaModifierId ?? null
      if (body.userProfileId !== undefined)
        update.userProfileId = body.userProfileId ?? null
      if (body.rollingSummaryEnabled !== undefined)
        update.rollingSummaryEnabled = body.rollingSummaryEnabled
      if (body.rollingSummaryModelId !== undefined)
        update.rollingSummaryModelId = body.rollingSummaryModelId ?? null

      if (Object.keys(update).length === 0) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'At least one field must be provided',
          statusCode: 400,
        })
      }

      const row = await db
        .updateTable('chats.conversations')
        .set(update)
        .where('id', '=', conversationId)
        .returningAll()
        .executeTakeFirst()

      if (!row) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Conversation ${conversationId} not found`,
          statusCode: 404,
        })
      }

      return formatConversation(row)
    }
  )

  // DELETE — DELETE /api/v1/conversations/:conversationId
  app.delete(
    '/:conversationId',
    {
      schema: {
        params: conversationParamsSchema,
        response: {
          204: z.null(),
          404: errorResponseSchema,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const { conversationId } = request.params as ConversationParams

      const result = await db
        .deleteFrom('chats.conversations')
        .where('id', '=', conversationId)
        .executeTakeFirst()

      if (result.numDeletedRows === 0n) {
        return reply.status(404).send({
          error: 'Not Found',
          message: `Conversation ${conversationId} not found`,
          statusCode: 404,
        })
      }

      return reply.status(204).send()
    }
  )

  // Child routes
  await app.register(conversationMessageRoutes, {
    prefix: '/:conversationId/messages',
  })
}

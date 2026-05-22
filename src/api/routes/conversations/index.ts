import type { ChatsConversations, DB } from '@tavrik/core/database'
import { db } from '@tavrik/core/database'
import type { Selectable, UpdateObject } from 'kysely'
import { z } from 'zod'
import type { AppInstance } from '../../types.js'
import { conversationMessageRoutes } from './[conversationId]/messages/index.js'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const numericId = z.string().regex(/^\d+$/, 'must be a numeric ID')

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const conversationResponse = z.object({
  id: z.string(),
  title: z.string(),
  archived: z.boolean(),
  ephemeral: z.boolean(),
  chatModelId: z.string(),
  personaId: z.string().nullable(),
  personaModifierId: z.string().nullable(),
  userProfileId: z.string().nullable(),
  rollingSummaryEnabled: z.boolean(),
  rollingSummaryModelId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const conversationListResponse = z.object({
  data: z.array(conversationResponse),
  total: z.number(),
})

const createConversationBody = z.object({
  title: z.string().min(1).max(255),
  chatModelId: numericId,
  personaId: numericId.nullable().optional(),
  personaModifierId: numericId.nullable().optional(),
  userProfileId: numericId.nullable().optional(),
  rollingSummaryEnabled: z.boolean().optional(),
  rollingSummaryModelId: numericId.nullable().optional(),
  ephemeral: z.boolean().optional(),
})

const updateConversationBody = z.object({
  title: z.string().min(1).max(255).optional(),
  archived: z.boolean().optional(),
  chatModelId: numericId.optional(),
  personaId: numericId.nullable().optional(),
  personaModifierId: numericId.nullable().optional(),
  userProfileId: numericId.nullable().optional(),
  rollingSummaryEnabled: z.boolean().optional(),
  rollingSummaryModelId: numericId.nullable().optional(),
})

const conversationParams = z.object({
  conversationId: numericId,
})

const listQuerystring = z.object({
  archived: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

const errorResponse = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
})

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
        querystring: listQuerystring,
        response: { 200: conversationListResponse },
        tags: ['Conversations'],
      },
    },
    async (request) => {
      const { archived, limit, offset } = request.query as z.infer<
        typeof listQuerystring
      >

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

  // GET ONE — GET /api/v1/conversations/:conversationId
  app.get(
    '/:conversationId',
    {
      schema: {
        params: conversationParams,
        response: {
          200: conversationResponse,
          404: errorResponse,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const { conversationId } = request.params as z.infer<
        typeof conversationParams
      >

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
        body: createConversationBody,
        response: {
          201: conversationResponse,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const body = request.body as z.infer<typeof createConversationBody>

      const row = await db
        .insertInto('chats.conversations')
        .values({
          title: body.title,
          chatModelId: body.chatModelId,
          personaId: body.personaId ?? null,
          personaModifierId: body.personaModifierId ?? null,
          userProfileId: body.userProfileId ?? null,
          rollingSummaryEnabled: body.rollingSummaryEnabled ?? true,
          rollingSummaryModelId: body.rollingSummaryModelId ?? null,
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
        params: conversationParams,
        body: updateConversationBody,
        response: {
          200: conversationResponse,
          400: errorResponse,
          404: errorResponse,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const { conversationId } = request.params as z.infer<
        typeof conversationParams
      >
      const body = request.body as z.infer<typeof updateConversationBody>

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
        params: conversationParams,
        response: {
          204: z.null(),
          404: errorResponse,
        },
        tags: ['Conversations'],
      },
    },
    async (request, reply) => {
      const { conversationId } = request.params as z.infer<
        typeof conversationParams
      >

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

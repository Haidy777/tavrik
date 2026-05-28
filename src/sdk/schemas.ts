import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export const numericId = z.string().regex(/^\d+$/, 'must be a numeric ID')

export type NumericId = z.infer<typeof numericId>

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded', 'error']),
  timestamp: z.string(),
  database: z.boolean(),
})

export type HealthResponse = z.infer<typeof healthResponseSchema>

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export const conversationResponseSchema = z.object({
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

export type ConversationResponse = z.infer<typeof conversationResponseSchema>

export const conversationListResponseSchema = z.object({
  data: z.array(conversationResponseSchema),
  total: z.number(),
})

export type ConversationListResponse = z.infer<
  typeof conversationListResponseSchema
>

export const createConversationBodySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  chatModelId: numericId.optional(),
  personaId: numericId.nullable().optional(),
  personaModifierId: numericId.nullable().optional(),
  userProfileId: numericId.nullable().optional(),
  rollingSummaryEnabled: z.boolean().optional(),
  rollingSummaryModelId: numericId.nullable().optional(),
  ephemeral: z.boolean().optional(),
})

export type CreateConversationBody = z.infer<
  typeof createConversationBodySchema
>

export const updateConversationBodySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  archived: z.boolean().optional(),
  chatModelId: numericId.optional(),
  personaId: numericId.nullable().optional(),
  personaModifierId: numericId.nullable().optional(),
  userProfileId: numericId.nullable().optional(),
  rollingSummaryEnabled: z.boolean().optional(),
  rollingSummaryModelId: numericId.nullable().optional(),
})

export type UpdateConversationBody = z.infer<
  typeof updateConversationBodySchema
>

export const conversationParamsSchema = z.object({
  conversationId: numericId,
})

export type ConversationParams = z.infer<typeof conversationParamsSchema>

export const conversationListQuerystringSchema = z.object({
  archived: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

export type ConversationListQuerystring = z.infer<
  typeof conversationListQuerystringSchema
>

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
})

export type ErrorResponse = z.infer<typeof errorResponseSchema>

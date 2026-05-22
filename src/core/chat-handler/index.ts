import type { Selectable } from 'kysely'
import type {
  ChatsConversations,
  ChatsMessageSource,
} from '../database/generated.js'
import { db } from '../database/index.js'
import { getSetting } from '../database/settings/index.js'
import { ENV_CONFIG } from '../env.js'
import { logger } from '../logger.js'
import { sendMessage } from '../provider/index.js'
import { autoSummarize } from './auto-summarize.js'

export async function createConversation(
  chatModelId?: string,
  rollingSummaryModelId?: string,
  personaId?: string,
  personaModifierId?: string,
  userProfileId?: string
): Promise<Selectable<ChatsConversations>> {
  // todo not always set defaults only if set defaults = true (new param later)
  const usedChatModelId =
    chatModelId || (await getSetting('default_chat_model_id'))?.id

  if (!usedChatModelId) {
    throw new Error('No chat model set')
  }

  const usedRollingSummaryModel =
    rollingSummaryModelId ||
    (await getSetting('default_rolling_summary_model_id'))?.id ||
    null

  const usedPersonaId =
    personaId || (await getSetting('default_persona_id'))?.id || null

  const usedPersonaModifierId =
    personaModifierId ||
    (await getSetting('default_persona_modifier_id'))?.id ||
    null

  const usedUserProfileId =
    userProfileId || (await getSetting('default_user_profile_id'))?.id || null

  return db
    .insertInto('chats.conversations')
    .values({
      title: `${new Date().toISOString()}`,
      rollingSummaryModelId: usedRollingSummaryModel,
      chatModelId: usedChatModelId,
      personaId: usedPersonaId,
      personaModifierId: usedPersonaModifierId,
      userProfileId: usedUserProfileId,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function handleChatMessage(
  conversationId: string,
  message: string,
  source: ChatsMessageSource = 'web'
) {
  logger.debug(
    { func: 'handleChatMessage', conversationId, message, source },
    `Received new message in ${conversationId} from ${source}`
  )

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

    logger.debug(
      { func: 'handleChatMessage', personaId: conversation.personaId },
      `Retrieved persona ${persona.name}`
    )

    systemPrompt += persona.systemPrompt
  }

  if (conversation.personaModifierId) {
    const personaModifier = await db
      .selectFrom('personas.modifiers')
      .select(['name', 'systemPromptModifier'])
      .where('id', '=', conversation.personaModifierId)
      .executeTakeFirstOrThrow()

    logger.debug(
      {
        func: 'handleChatMessage',
        personaModifierId: conversation.personaModifierId,
      },
      `Retrieved persona modifier ${personaModifier.name}`
    )

    systemPrompt += `\n\n${personaModifier.systemPromptModifier}`
  }

  let userProfile = null

  if (conversation.userProfileId) {
    userProfile = await db
      .selectFrom('personas.userProfiles')
      .selectAll()
      .where('id', '=', conversation.userProfileId)
      .executeTakeFirstOrThrow()

    logger.debug(
      {
        func: 'handleChatMessage',
        userProfileId: conversation.userProfileId,
      },
      `Retrieved user profile ${userProfile.name}`
    )

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
    source
  )

  if (summaryResult) {
    systemPrompt += `\n\n${summaryResult.summaryText}`
  }

  await db
    .insertInto('chats.messages')
    .values({
      conversationId,
      content: message,
      source,
      role: 'user',
    })
    .execute()

  const messagesToSend = [
    ...(summaryResult ? summaryResult.messagesToSend : messageHistory),
    { role: 'user' as const, content: message },
  ]

  if (ENV_CONFIG.DEBUG_LOG_FULL_PROMPTS) {
    logger.debug(
      {
        func: 'handleChatMessage',
        systemPrompt,
      },
      'Full system prompt'
    )
  }

  try {
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
        source,
        inputTokens: response.inputTokens,
        outputTokens: response.outputTokens,
      })
      .execute()

    return response.textResponse
  } catch (err) {
    logger.error(err)
  }
}

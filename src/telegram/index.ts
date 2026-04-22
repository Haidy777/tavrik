import { db, logger, migrateToLatest } from '@tavrik/lib'
import { Bot, type Context } from 'grammy'
import type { Selectable } from 'kysely'
import {
  createConversation,
  handleChatMessage,
} from '../lib/chat-handler/index.js'
import type { ChatsConversations } from '../lib/database/generated.js'
import { ENV_CONFIG } from '../lib/env.js'
import { authMiddleware } from './auth.js'

async function handleMessage(ctx: Context, _bot: Bot) {
  await ctx.replyWithChatAction('typing')

  const message = ctx.message?.text || ''

  if (message === '') {
    await ctx.reply('Please send a message')
    return
  }

  const latestConversation = await db
    .selectFrom('chats.conversations')
    .selectAll()
    .orderBy('createdAt', 'desc')
    .limit(1)
    .executeTakeFirst()
  let conversation: Selectable<ChatsConversations>

  if (latestConversation) {
    conversation = latestConversation
  } else {
    conversation = await createConversation()
  }

  const modelResponse = await handleChatMessage(conversation.id, message)

  await ctx.reply(modelResponse || 'Sorry, I could not understand that.')
}

;(async () => {
  if (!ENV_CONFIG.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set')
  }

  await migrateToLatest()

  const bot = new Bot(ENV_CONFIG.TELEGRAM_BOT_TOKEN)

  bot.use(authMiddleware)

  bot.command('start', async (ctx) => {
    await ctx.reply('Welcome to Tavrik!')
  })

  bot.on('message:text', async (ctx) => handleMessage(ctx, bot))

  await bot.start({
    onStart: (botInfo) => {
      logger.info({ username: botInfo.username }, '✅ Bot started')
      logger.info('📱 Ready to receive messages')
    },
  })
})()

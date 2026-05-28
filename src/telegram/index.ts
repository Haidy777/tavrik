import { logger, migrateToLatest } from '@tavrik/core'
import { loadAndStoreAvailableModel } from '@tavrik/core/provider'
import { type ConversationResponse, TavrikClient } from '@tavrik/sdk'
import { Bot, type Context } from 'grammy'

import { handleChatMessage } from '../core/chat-handler/index.js'
import { ENV_CONFIG } from '../core/env.js'
import { authMiddleware } from './auth.js'

async function handleMessage(client: TavrikClient, ctx: Context, _bot: Bot) {
  await ctx.replyWithChatAction('typing')

  const message = ctx.message?.text || ''

  if (message === '') {
    await ctx.reply('Please send a message')
    return
  }

  const latestConversation = await client.conversations.getLatest()

  let conversation: ConversationResponse

  if (latestConversation) {
    conversation = latestConversation
  } else {
    conversation = await client.conversations.create()
  }

  const modelResponse = await handleChatMessage(conversation.id, message)

  await ctx.reply(modelResponse || 'Sorry, I could not understand that.')
}

;(async () => {
  if (!ENV_CONFIG.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set')
  }

  await migrateToLatest()
  await loadAndStoreAvailableModel()

  // TODO maybe move the migration stuff to the api too? some form of inital request after new Client maybe?

  const client = new TavrikClient({ baseUrl: 'localhost:3001' }) // todo make configurable via env

  await client.connect()

  const bot = new Bot(ENV_CONFIG.TELEGRAM_BOT_TOKEN)

  bot.use(authMiddleware)

  bot.command('start', async (ctx) => {
    await ctx.reply('Welcome to Tavrik!')
  })

  bot.on('message:text', async (ctx) => handleMessage(client, ctx, bot))

  await bot.start({
    onStart: (botInfo) => {
      logger.info({ username: botInfo.username }, '✅ Bot started')
      logger.info('📱 Ready to receive messages')
    },
  })
})()

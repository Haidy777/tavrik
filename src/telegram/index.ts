import { logger } from '@tavrik/core'
import { type ConversationResponse, TavrikClient } from '@tavrik/sdk'
import { Bot, type Context } from 'grammy'

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

  const modelResponse = await client.conversations
    .messages(conversation.id)
    .send(message, 'telegram')

  await ctx.reply(
    modelResponse.modelResponse || 'Sorry, I could not understand that.'
  )
}

;(async () => {
  if (!ENV_CONFIG.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set')
  }

  const client = new TavrikClient({ baseUrl: ENV_CONFIG.API_URL })

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

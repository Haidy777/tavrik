import { logger } from '@tavrik/lib'
import type { Context, NextFunction } from 'grammy'
import { ENV_CONFIG } from '../lib/env.js'

export async function authMiddleware(ctx: Context, next: NextFunction) {
  const userId = ctx.from?.id

  if (!userId) {
    logger.warn(
      { mod: 'telegram/auth', chatId: ctx.chat?.id },
      'No user ID in update'
    )
    await ctx.reply('Sorry, I could not identify you. 🔒')
    return
  }

  if (userId !== ENV_CONFIG.TELEGRAM_USER_ID) {
    logger.warn(
      { mod: 'telegram/auth', chatId: ctx.chat?.id },
      'Unauthorized user ID'
    )

    await ctx.reply('Sorry, you are not allowed to use this bot. 🔒')
    return
  }

  await next()
}

import { ENV_CONFIG } from '@tavrik/core/env'
import { TavrikClient } from '@tavrik/sdk'

;(async () => {
  const client = new TavrikClient({ baseUrl: ENV_CONFIG.API_URL })
  await client.connect()

  // default -> gpt4o
  // 7 -> claude-haiku-4-5-20251001
  // 8 -> gemini-2.5-flash
  const conversation = await client.conversations.create()
  console.log(
    (
      await client.conversations
        .messages(conversation.id)
        .send('Just testing the Api connection :)', 'web')
    ).modelResponse
  )
  console.log(
    (
      await client.conversations
        .messages(conversation.id)
        .send('Sorry to bother you, secondary testing message :)', 'web')
    ).modelResponse
  )

  process.exit(0)
})()

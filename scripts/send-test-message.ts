import { createConversation, handleChatMessage } from '../src/lib/chat-handler'

;(async () => {
  // default -> gpt4o
  // 7 -> claude-haiku-4-5-20251001
  // 8 -> gemini-2.5-flash
  const conversation = await createConversation()
  console.log(
    await handleChatMessage(
      conversation.id,
      'Just testing the Api connection :)'
    )
  )
  console.log(
    await handleChatMessage(
      conversation.id,
      'Sorry to bother you, secondary testing message :)'
    )
  )

  process.exit(0)
})()

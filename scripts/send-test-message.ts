import { createConversation, handleChatMessage } from '../src/lib/chat-handler'

;(async () => {
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

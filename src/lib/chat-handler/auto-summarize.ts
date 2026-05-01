import type { Selectable } from 'kysely'
import type { ChatsMessageSource, Language } from '../database/generated.js'
import { db } from '../database/index.js'
import type { DB } from '../database/overrides.js'
import { getSetting } from '../database/settings/index.js'
import { trackUsage } from '../database/usage-tracking/index.js'
import { moduleLogger } from '../logger.js'
import { sendMessage } from '../provider/index.js'

const logger = moduleLogger('chatHandler/auto-summarize')

// todo make configurable
const SUMMARY_PROMPTS: {
  de: {
    base: string
    previous: string
    convoWrapper: string
    convoWrapperNewMessages: string
    conversationLabel: string
    modifier: string
    returnWrapper: string
  }
  en: {
    base: string
    previous: string
    convoWrapper: string
    convoWrapperNewMessages: string
    conversationLabel: string
    modifier: string
    returnWrapper: string
  }
} = {
  de: {
    base: 'Du bist ein Experte für Gesprächszusammenfassungen. Erstelle präzise, informative Zusammenfassungen.',
    previous: '**Vorherige Zusammenfassung:**',
    convoWrapper: `Du bist ein Experte darin, Gespräche präzise zusammenzufassen.

Fasse das folgende Gespräch zwischen dem Benutzer und Assistant (KI-Assistentin) zusammen.

Wichtig:
- Fokussiere auf die wichtigsten Themen, Entscheidungen und Erkenntnisse
- Behalte konkrete Informationen (Zahlen, Daten, spezifische Pläne)
- Erwähne Stimmungen oder emotionale Kontexte, wenn relevant
- Schreibe in der 3. Person ("Der Benutzer erwähnte...", "Assistent schlug vor...")
- Halte es prägnant aber informativ (max. 500 Wörter)
- Auf Deutsch

Format:
**Hauptthemen:** [Liste der Themen]
**Wichtige Punkte:** [Bullet points der Key Takeaways]
**Kontext:** [Relevanter emotionaler/situativer Kontext]
**Follow-ups:** [Offene Themen oder Dinge zum Nachverfolgen]`,
    convoWrapperNewMessages:
      '**Neue Nachrichten seit der letzten Zusammenfassung:**',
    conversationLabel: '**Gespräch:**',
    modifier:
      'Erstelle eine KUMULATIVE Zusammenfassung, die die vorherige Zusammenfassung mit den neuen Informationen kombiniert. Achte darauf, wichtige Entwicklungen und Veränderungen hervorzuheben.',
    returnWrapper: '**Bisherige Gesprächszusammenfassung:**',
  },
  en: {
    base: 'You are an expert at summarizing conversations. Create precise, informative summaries.',
    previous: '**Previous summary:**',
    convoWrapper: `You are an expert at summarizing conversations precisely.

Summarize the following conversation between the user and Assistant (AI assistant).

Important:
- Focus on the most important topics, decisions, and insights
- Retain specific information (numbers, dates, concrete plans)
- Mention moods or emotional context when relevant
- Write in the third person ("The user mentioned...", "Assistant suggested...")
- Keep it concise but informative (max 500 words)
- In English

Format:
**Main topics:** [List of topics]
**Key points:** [Bullet points of key takeaways]
**Context:** [Relevant emotional/situational context]
**Follow-ups:** [Open topics or things to follow up on]`,
    convoWrapperNewMessages: '**New messages since the last summary:**',
    conversationLabel: '**Conversation:**',
    modifier:
      'Create a CUMULATIVE summary that combines the previous summary with the new information. Make sure to highlight important developments and changes.',
    returnWrapper: '**Conversation summary so far:**',
  },
}

const MESSAGE_SUMMARY_COUNT = 20

export interface SummaryResult {
  summaryText: string
  messagesToSend: Selectable<DB['chats.messages']>[]
}

export async function autoSummarize(
  conversation: Selectable<DB['chats.conversations']>,
  history: Selectable<DB['chats.messages']>[],
  language: Language,
  source: ChatsMessageSource = 'web'
): Promise<SummaryResult | null> {
  if (
    conversation.rollingSummaryEnabled &&
    conversation.rollingSummaryModelId
  ) {
    logger.info(`Auto-summarizing conversation ${conversation.id}`)
    let summaryPrompt = SUMMARY_PROMPTS.en

    if (language === 'de') {
      summaryPrompt = SUMMARY_PROMPTS.de
    }

    const summaryModelId = conversation.rollingSummaryModelId

    const messageCountForSummary =
      (await getSetting('default_rolling_summary_message_count'))?.count ||
      MESSAGE_SUMMARY_COUNT
    const totalMessageCount = history.length

    if (conversation.rollingSummary) {
      // existing rolling summary, needs update?
      const afterSummaryMessages = history.filter(
        (m) => m.createdAt > conversation.rollingSummaryCreatedAt
      )

      if (afterSummaryMessages.length >= messageCountForSummary) {
        const conversationText = afterSummaryMessages
          .map(({ role, content }) => `${role}: ${content}\n\n`)
          .join('')

        const summaryResponse = await sendMessage(
          summaryModelId,
          summaryPrompt.base,
          [
            {
              role: 'user',
              content: `${summaryPrompt.convoWrapper}\n\n---\n\n${summaryPrompt.previous}\n\n${conversation.rollingSummary}\n\n---\n\n${summaryPrompt.convoWrapperNewMessages}\n\n${conversationText}\n\n---\n\n${summaryPrompt.modifier}`,
            },
          ]
        )

        await trackUsage(
          summaryModelId,
          'autoSummarize',
          summaryResponse.inputTokens,
          summaryResponse.outputTokens,
          source
        )

        await db
          .updateTable('chats.conversations')
          .set({
            rollingSummary: summaryResponse.textResponse,
            rollingSummaryCreatedAt: new Date(),
          })
          .where('id', '=', conversation.id)
          .execute()

        return {
          summaryText: `${summaryPrompt.returnWrapper}\n\n${summaryResponse.textResponse}`,
          messagesToSend: afterSummaryMessages,
        }
      } else {
        return {
          summaryText: `${summaryPrompt.returnWrapper}\n\n${conversation.rollingSummary}`,
          messagesToSend: afterSummaryMessages,
        }
      }
    } else if (totalMessageCount >= messageCountForSummary) {
      const conversationText = history
        .map(({ role, content }) => `${role}: ${content}\n\n`)
        .join('')

      const summaryResponse = await sendMessage(
        summaryModelId,
        summaryPrompt.base,
        [
          {
            role: 'user',
            content: `${summaryPrompt.convoWrapper}\n\n---\n\n${summaryPrompt.conversationLabel}\n\n${conversationText}`,
          },
        ]
      )

      await trackUsage(
        summaryModelId,
        'autoSummarize',
        summaryResponse.inputTokens,
        summaryResponse.outputTokens,
        source
      )

      await db
        .updateTable('chats.conversations')
        .set({
          rollingSummary: summaryResponse.textResponse,
          rollingSummaryCreatedAt: new Date(),
        })
        .where('id', '=', conversation.id)
        .execute()

      return {
        summaryText: `${summaryPrompt.returnWrapper}\n\n${summaryResponse.textResponse}`,
        messagesToSend: history,
      }
    }
  }

  return null
}

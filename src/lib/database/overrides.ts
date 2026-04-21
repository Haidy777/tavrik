import type { ColumnType } from 'kysely'
import type { DB as GeneratedDB } from './generated.js'

interface ToolCall {
  name: string
  input: Record<string, unknown>
  result?: unknown
}

interface VoiceInfo {
  duration: number
  language: string
}

type Attachments = {
  images: string[]
}

export interface SettingsMap {
  default_chat_model_id: { id: number } | null
  default_rolling_summary_model_id: { id: number } | null
  default_persona_id: { id: number } | null
  default_persona_modifier_id: { id: number } | null
  default_user_profile_id: { id: number } | null
}

export type SettingName = keyof SettingsMap

export type DB = Omit<GeneratedDB, 'chats.messages'> & {
  'chats.messages': Omit<
    GeneratedDB['chats.messages'],
    'toolCalls' | 'voiceInfo' | 'attachments'
  > & {
    toolCalls: ColumnType<
      ToolCall[] | null,
      ToolCall[] | null,
      ToolCall[] | null
    >
    voiceInfo: ColumnType<VoiceInfo | null, VoiceInfo | null, VoiceInfo | null>
    attachments: ColumnType<
      Attachments | null,
      Attachments | null,
      Attachments | null
    >
  }
}

import { type Kysely, sql } from 'kysely'
import { addComment, createTable } from '../helpers.js'

export async function up(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`CREATE SCHEMA IF NOT EXISTS chats`.execute(db)

  await createTable(db, 'chats', 'conversations', (builder) =>
    builder
      .addColumn('title', 'text', (col) => col.notNull())
      .addColumn('rolling_summary', 'text')
      .addColumn('rolling_summary_created_at', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
      )
      .addColumn('rolling_summary_model_id', 'bigint')
      .addForeignKeyConstraint(
        'conversations_rolling_summary_model_id_fk',
        ['rolling_summary_model_id'],
        'provider.models',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
      .addColumn('rolling_summary_enabled', 'boolean', (col) =>
        col.notNull().defaultTo(true)
      )
      .addColumn('archived', 'boolean', (col) => col.notNull().defaultTo(false))
      .addColumn('ephemeral', 'boolean', (col) =>
        col.notNull().defaultTo(false)
      )
      .addColumn('chat_model_id', 'bigint', (col) => col.notNull())
      .addForeignKeyConstraint(
        'conversations_chat_model_id_fk',
        ['chat_model_id'],
        'provider.models',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
      .addColumn('persona_id', 'bigint')
      .addForeignKeyConstraint(
        'conversations_persona_id_fk',
        ['persona_id'],
        'personas.personas',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
      .addColumn('persona_modifier_id', 'bigint')
      .addForeignKeyConstraint(
        'conversations_persona_modifier_id_fk',
        ['persona_modifier_id'],
        'personas.modifiers',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
      .addColumn('user_profile_id', 'bigint')
      .addForeignKeyConstraint(
        'conversations_user_profile_id_fk',
        ['user_profile_id'],
        'personas.user_profiles',
        ['id'],
        (cb) => cb.onDelete('cascade')
      )
  )

  await addComment(
    db,
    'TABLE',
    'chats.conversations',
    'Chat conversations with model and persona configuration'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.rolling_summary',
    'Auto-generated summary of conversation history'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.rolling_summary_created_at',
    'Timestamp of last rolling summary generation'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.rolling_summary_model_id',
    'Model used for generating rolling summaries'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.rolling_summary_enabled',
    'Whether automatic rolling summaries are active'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.archived',
    'Soft archive flag for hiding old conversations'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.ephemeral',
    'Ephemeral conversations are not loaded to memory'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.chat_model_id',
    'LLM model used for chat responses'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.persona_id',
    'Active persona for system prompt'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.persona_modifier_id',
    'Optional modifier applied to persona system prompt'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.conversations.user_profile_id',
    'User profile providing context to the LLM'
  )

  await db.schema
    .withSchema('chats')
    .createType('message_source')
    .asEnum(['web', 'telegram'])
    .execute()

  await createTable(db, 'chats', 'messages', (builder) =>
    builder
      .addColumn('conversation_id', 'bigint', (col) => col.notNull())
      .addForeignKeyConstraint(
        'messages_conversation_id_fk',
        ['conversation_id'],
        'conversations',
        ['id']
      )
      .addColumn('role', sql`role`, (col) => col.notNull())
      .addColumn('content', 'text', (col) => col.notNull())
      .addColumn('input_tokens', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('output_tokens', 'integer', (col) =>
        col.notNull().defaultTo(0)
      )
      .addColumn('total_tokens', 'integer', (col) =>
        col.generatedAlwaysAs(sql`input_tokens + output_tokens`).stored()
      )
      .addColumn('source', sql`chats.message_source`, (col) => col.notNull())
      .addColumn('tool_calls', 'jsonb')
      .addColumn('voice_info', 'jsonb')
      .addColumn('attachments', 'jsonb')
  )

  await addComment(
    db,
    'TYPE',
    'chats.message_source',
    'Origin of the message (web UI or telegram bot)'
  )
  await addComment(
    db,
    'TABLE',
    'chats.messages',
    'Individual messages within a conversation'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.messages.total_tokens',
    'Generated column: input_tokens + output_tokens'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.messages.tool_calls',
    'JSON array of tool calls made by the assistant'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.messages.voice_info',
    'Metadata for voice/TTS messages'
  )
  await addComment(
    db,
    'COLUMN',
    'chats.messages.attachments',
    'File attachments (images, etc.)'
  )
}

export async function down(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`DROP SCHEMA IF EXISTS chats CASCADE`.execute(db)
}

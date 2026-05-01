import { type Kysely, sql } from 'kysely'
import { addComment, createTable } from '../helpers.js'

export async function up(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`CREATE SCHEMA IF NOT EXISTS system`.execute(db)

  await createTable(db, 'system', 'settings', (builder) =>
    builder
      .addColumn('name', 'text', (col) => col.notNull().unique())
      .addColumn('value', 'jsonb', (col) => col.defaultTo('{}'))
  )

  await addComment(db, 'TABLE', 'system.settings', 'System settings')

  // used as a workaround so ts doesn't complain
  const untypedDb = db as Kysely<Record<string, Record<string, unknown>>>

  const [gpt4o, persona, profile] = await Promise.all([
    untypedDb
      .selectFrom('provider.models')
      .select(['id'])
      .where('name', '=', 'gpt-4o-2024-11-20')
      .executeTakeFirstOrThrow(),
    untypedDb
      .selectFrom('personas.personas')
      .select(['id'])
      .where('name', '=', 'Tavrik')
      .where('language', '=', 'en')
      .executeTakeFirstOrThrow(),
    untypedDb
      .selectFrom('personas.user_profiles')
      .select(['id'])
      .where('name', '=', 'USER')
      .where('language', '=', 'en')
      .executeTakeFirstOrThrow(),
  ])

  await db
    .insertInto('system.settings')
    .values([
      { name: 'default_chat_model_id', value: { id: gpt4o.id } },
      { name: 'default_rolling_summary_model_id', value: { id: gpt4o.id } },
      { name: 'default_rolling_summary_message_count', value: { count: 20 } },
      { name: 'default_persona_id', value: { id: persona.id } },
      { name: 'default_persona_modifier_id' },
      { name: 'default_user_profile_id', value: { id: profile.id } },
    ])
    .executeTakeFirstOrThrow()
}

export async function down(db: Kysely<Record<string, never>>): Promise<void> {
  await sql`DROP SCHEMA IF EXISTS system CASCADE`.execute(db)
}
